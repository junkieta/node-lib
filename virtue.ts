///<reference path="./virtue.d.ts" />

const _empty = () => { };

const PUSH : unique symbol = Symbol('PUSH');

// lift,CellSink,StreamSinkによるプッシュを実装するための関数。
const _run_continue = (callback: () => any) => {
    const action = () => Transaction.currentTransaction.push(callback);
    if (Transaction.currentTransaction.running)
        action();
    else
        Transaction.run(action);
};

type Output = Stream<unknown>|Cell<unknown>|Listener;

const _connections = new WeakMap<Stream<unknown>, Output | Output[]>();
const _updated = new Map<Cell<unknown>, unknown>();

function _connect(a: Stream<unknown>, b: Output) {
    const current = _connections.get(a);
    if (!current) {
        _connections.set(a,b);
    } else if (Array.isArray(current)) {
        if (current.find((c) => c === b)) return;
        _connections.set(a, current.concat(b));
    } else if (current !== b) {
        _connections.set(a, [current, b]);
    }
}

function _disconnect(source: Stream<unknown>, destination: Output) {
    if (!_connections.has(source)) return;
    const current = _connections.get(source);
    if (!Array.isArray(current)) {
        if (current === destination)
            _connections.delete(source);
        return;
    }
    const i = current.indexOf(destination);
    if (i === -1) return;
    current.splice(i, 1);
    if (current.length === 1)
        _connections.set(source, current[0]);
    else if (!current.length)
        _connections.delete(source);
}

const _flow = (dest: Stream<unknown>, input: unknown | Promise<unknown>) => {
    if(input instanceof Promise) {
        input.then((v) => _flow(dest, v));
        return;
    }

    let result: unknown;
    try {
        result = dest[PUSH](input);
    } catch (err) {
        if(err instanceof StreamingError) return;
        throw err;
    }

    let next = _connections.get(dest);
    if(!next) return;
    if(!Array.isArray(next)) next = [next];

    next.forEach((d) => {
        if (d instanceof Listener)
            d[PUSH](result);
        else if (d instanceof Cell)
            _updated.set(d, result);
        else
            _flow(d, result);
    });

};

export class Transaction extends Array<Function> {

    static currentTransaction = new Transaction();
    
    private static endCallback : Function[] = [];

    static run<A>(callback: () => A): A {
        const tr_previous = Transaction.currentTransaction;
        const tr = Transaction.currentTransaction = new Transaction();

        tr.running = true;
        const result = callback();
        while(tr.length) tr.splice(0).forEach((f) => f());
        if (_updated.size) Cell._applyUpdate(_updated);
        if (CellLoop._waiting.size || StreamLoop._waiting.size)
           throw new Error('StreamLoop と CellLoop はトランザクションの終了前に loop メソッドを呼び出す必要があります');
        tr.running = false;

        Transaction.currentTransaction = tr_previous;
        return result;
    }

    static onTransactionEnd(callback: Function) {
        Transaction.endCallback.push(callback);
    }

    public running: boolean;

    constructor() {
        super();
        this.running = false;
    }

}


/**
 * listenから返されるオブジェクト。
 * */
export class Listener {

    private _unlisten: Function;
    [PUSH]: (v: any) => void;

    constructor(f1?: (v: any) => void, f2?: Function) {
        this[PUSH] = f1 || _empty;
        this._unlisten = f2 || _empty;
    }

    append(that: Listener): Listener {
        return new Listener(_empty, () => {
            this.unlisten();
            that.unlisten();
        });
    }

    unlisten() {
        this._unlisten();
        this[PUSH] = this._unlisten = _empty;
    }

}

/**
 * Stream::filterで検知するエラー。
 * */
class StreamingError extends Error { }

export class Stream<A> {

    static PASS_THROUGH<A>(value: A): A {
        return value;
    }

    [PUSH]: (value: any) => A;

    constructor(callback?: ((value: any) => A | Promise<A>) | Promise<A>) {
        if (callback instanceof Promise) {
            this[PUSH] = Stream.PASS_THROUGH;
            callback.then((v) => this[PUSH](v));
        } else {
            this[PUSH] = typeof callback === 'function' ? callback : never[PUSH];
        }
    }

    /**
     * 値の受け取りを監視するListenerを返す。
     * @param handler
     */
    listen(handler: (value: A) => void): Listener {
        const l = new Listener(handler, () => _disconnect(this, l));
        _connect(this, l);
        return l;
    }

     /**
     * 一度きりの実行で登録を解除するListen
     * @param handler
     */
    listenOnce(handler: (value: A) => void): Listener {
        const l = this.listen((v: A) => {
            handler(v);
            l.unlisten();
        });
        return l;
    }

    /**
     * 自身の後に連結されるStreamを返す。
     */
    map<B>(action: (arg: A) => B | Promise<B>): Stream<B> {
        const s = new Stream(action);
        _connect(this, s);
        return s;
    }

    /**
     * 定数値ストリームに変換する
     * @param b
     */
    mapTo<B>(b: B) : Stream<B> {
        return this.map(() => b);
    }

    /*
     * 値を受け取るセルを生成する。引数は初期値。
     */
    hold(init: A): Cell<A> {
        const c = new Cell(init, this);
        _connect(this, c);
        return c;
    }

    /**
     * 複数のStreamを一つのStreamにまとめる
     * @param that
     * @param lambda
     */
    merge(that: Stream<A> | Stream<A>[], lambda: (...values: A[]) => A = Stream.PASS_THROUGH): Stream<A> {
        const inputs = ([this] as Stream<A>[]).concat(that);
        const merged = new Stream<A>(Stream.PASS_THROUGH);
        const EMPTY = Symbol('EMPTY');
        const values: Array<A | Symbol> = Array(inputs.length).fill(EMPTY);
        const action = () =>
            merged[PUSH](
                lambda(...<A[]>values
                    .splice(0, values.length, ...Array(values.length).fill(EMPTY))
                    .filter((v) => v !== EMPTY)));

        inputs.forEach((s, i) => s.listen((v) => {
            const run_flag = values.every((v) => v === EMPTY);
            values[i] = v;
            if (run_flag) _run_continue(action);
        }));
        return merged;
    }


    /**
     * predicateからtrueを返された値だけ受け取るStreamを生成する。
     */
    filter(predicate: A): Stream<A>;
    filter(predicate: RegExp): Stream<A>;
    filter(predicate: (value: A) => boolean): Stream<A>;
    filter(predicate: any): Stream<A> {
        const check = typeof predicate === 'function'
            ? predicate
            : (<RegExp | A> predicate) instanceof RegExp
            ? (v: A) => (<RegExp>predicate).test(String(v))
            : (v: A) => v === predicate;
        const push = (value: any) => {
            if (!check(value)) throw new StreamingError('invalid value');
            return value;
        };
        return this.map(push);
    }

    /**
     * 自身からcellの値を受け取るStreamを生成する。
     */
    snapshot<B,C>(c: Cell<B>, action: (a: A, b: B) => C): Stream<C>;
    snapshot<C>(c: Cell<any>[], action: (...values: any[]) => C): Stream<C>;
    snapshot<B,C>(cell: Cell<B> | Cell<any>[], action?: (...values: any[]) => C): Stream<C> {
        const cell_list = Array.isArray(cell) ? cell : [cell];
        const get_cell_value = () => cell_list.map((c) => c.valueOf());
        return typeof action === 'function'
            ? this.map((v) => action(v, ...get_cell_value()))
            : cell_list.length > 1
                ? this.map(() => <C> <unknown> get_cell_value())
                : this.map(() => <C> cell.valueOf());
    }

}

const never = new Stream<any>(() => { throw new StreamingError('never stream cannot [PUSH]') }); {
    const descriptor_return_never = { value: () => never };
    Object.defineProperties(never, {
        map: descriptor_return_never,
        filter: descriptor_return_never,
        snapshot: descriptor_return_never,
        merge: descriptor_return_never
    });
}

export class Cell<A> {

    static switchC<A>(cell: Cell<Cell<A>>): Cell<A> {
        const s = new Stream<A>(Stream.PASS_THROUGH);
        cell.listen((v) => {
            _disconnect(cell.valueOf()._stream, s);
            _connect(v._stream, s);
            s[PUSH](v.valueOf());
        });
        return s.hold(cell.valueOf().valueOf());
    }

    static switchS<A>(cell: Cell<Stream<A>>): Stream<A> {
        const s = new Stream<A>(Stream.PASS_THROUGH);
        cell.listen((v) => {
            _disconnect(cell.valueOf(), s);
            _connect(v, s);
        });
        return s;
    }

    static _applyUpdate(updates: Map<Cell<unknown>,unknown>) {
        updates.forEach((value,cell) => cell._value = value);
    }

    static _getStream<A>(c: Cell<A>) {
        return c._stream;
    }

    protected _value: A;
    protected _stream: Stream<A>;

    constructor(init: A, stream?: Stream<A>) {
        this._value = init;
        this._stream = stream instanceof Stream ? stream : never;
    }

    /**
     * listenerを登録する。Streamとは違い、初期値があるので即座に一度発火する。
     */
    listen(action: (v: A) => void): Listener {
        const l = this._stream.listen(action);
        action(this.valueOf());
        return l;
    }

    /**
     * 別のセルに自身の値をマッピングする。
     */
    map<B>(action: (value: A) => B): Cell<B> {
        return this._stream.map(action).hold(action(this.valueOf()));
    }

    /**
     * 自身と他のセルを元にする新しいCellを返す
     */
    lift<R,B>(that: Cell<B>|[Cell<B>], lambda: (a:A,b:B) => R) : Cell<R>;
    lift<R,B,C>(that: Cell<B>|[Cell<B>,Cell<C>], lambda: (a:A,b:B,c:C) => R): Cell<R>;
    lift<R,B,C,D>(that: Cell<B>|[Cell<B>,Cell<C>,Cell<D>], lambda: (a:A,b:B,c:C,d:D) => R): Cell<R>;
    lift<R,B,C,D,E>(that: Cell<B>|[Cell<B>,Cell<C>,Cell<D>,Cell<E>], lambda: (a:A,b:B,c:C,d:D,e:E) => R): Cell<R>;
    lift<R>(that: Cell<any> | Cell<any>[], lambda: (a:A,...b:any[]) => R): Cell<R> {
        const stream = new Stream<R>(Stream.PASS_THROUGH);
        const cells = (<Cell<A>[]>[this]).concat(<Cell<any>|Cell<any>[]>that);
        const values : any[] = [];

        let update_flag = true;
        cells.forEach((c, i) => c.listen((v) => {
            values[i] = v;
            if (update_flag) return;
            update_flag = true;
            _run_continue(push);
        }));
        update_flag = false;

        return stream.hold(lambda(...<[A]>values));

        function push() {
            stream[PUSH](lambda(...<[A]>values));
            update_flag = false;
        }

    }

    /**
     * 格納中の値を返す。sodium で言うところのsample()。
     */
    valueOf(): A {
        return this._value;
    }

    toString(): string {
        return this._value + '';
    }

}

export class StreamLoop<A> extends Stream<A> {

    static _waiting: Set<StreamLoop<unknown>> = new Set();

    constructor() {
        if(!Transaction.currentTransaction.running) throw new Error('StreamLoopはトランザクション中にしか作成できません');
        super(Stream.PASS_THROUGH);
        StreamLoop._waiting.add(this);
    }

    loop(out: Stream<A>) {
        if(!StreamLoop._waiting.has(this)) throw new Error('loopメソッドは既に呼び出し済みです');
        StreamLoop._waiting.delete(this);
        _connect(out, this);
    }

}

export class CellLoop<A> extends Cell<A> {

    static BEFORE_INIT = Symbol('before_init');
    static _waiting : Set<CellLoop<unknown>> = new Set();

    constructor() {
        if(!Transaction.currentTransaction.running) throw new Error('CellLoopはトランザクション中にしか作成できません');
        super(<any>CellLoop.BEFORE_INIT, new Stream<A>(Stream.PASS_THROUGH));
        CellLoop._waiting.add(this);
    }

    loop(out: Cell<A>) {
        if (!CellLoop._waiting.has(this)) throw new Error('loopメソッドは既に呼び出し済みです')
        CellLoop._waiting.delete(this);

        const proxy = Cell._getStream(this);
        const origin = Cell._getStream(out);
        const added = _connections.get(proxy);

        this._stream = origin;
        this._value = out.valueOf();
        if (!added) return;

        _connections.delete(proxy);
        if(Array.isArray(added))
            added.forEach(_connect.bind(null, origin));
        else
            _connect(origin, added);
    }

}

export class StreamSink<A> extends Stream<A> {

    private _queue: A[];

    static valueOfLast<A>(values: A[]): A {
        return values[values.length - 1];
    }

    constructor(colease?: (...values: A[]) => A) {
        super(colease
            ? (values: A[]) => colease(...values)
            : StreamSink.valueOfLast);
        this._queue = [];
    }

    send(value: A) {
        if (this._queue.push(value) === 1)
            _run_continue(() => _flow(this, this._queue.splice(0)));
    }

}

export class CellSink<A> extends Cell<A> {

    private _queue: A[];

    static takeFirstArg<A>(values: A[]): A {
        return values[0];
    }

    constructor(init: A, colease?: (...value: A[]) => A) {
        super(init, new Stream<A>(colease
            ? (values: A[]) => colease(...values)
            : CellSink.takeFirstArg));
        this._queue = [];
    }

    send(value: A) {
        if (this._queue.push(value) === 1)
            _run_continue(() => _flow(this._stream, this._queue.splice(0)));
    }

}

// 以下はVirtualDOM実装

type ElementSource = {
    $?: AttributesSource | Cell<AttributesSource>;
} & {
    [P in keyof HTMLElementTagNameMap]?: NodeSource;
} | {
    [key: string]: NodeSource | AttributesSource | Cell<AttributesSource>;
};

type DOMStringSource = string | number | boolean | null | undefined | { toString() : string };

type TextNodeSource = DOMStringSource;

type DocumentFragmentSource =
    NodeSource[];

type NodeSource =
    Node | TextNodeSource | DocumentFragmentSource | ElementSource | Cell<NodeSource> | Promise<NodeSource>;

type AttrValue =
    DOMStringSource | string[] | DOMEventHandler[keyof DOMEventHandler] | StyleSource | DatasetSource | Promise<AttrValue> | Cell<AttrValue>;

type StyleSource = {
    [P in CSSPropertyName]: Cell<DOMStringSource> | DOMStringSource;
};

type DatasetSource = {
    [key: string]: Cell<DOMStringSource> | DOMStringSource;
};

type AttributesSource =
   { [P in HTMLAttrName]?: AttrValue; } & DOMEventHandler & { [key:string]: AttrValue | DOMEventHandler[keyof DOMEventHandler] };

type AttrSource =
    AttributesSource | StyleSource | DatasetSource;

type JSHTMLSource =
    NodeSource | AttrSource | AttrValue;

type ShadowEventMap = {
    abort: Stream<UIEvent>;
    animationcancel: Stream<AnimationEvent>;
    animationend: Stream<AnimationEvent>;
    animationiteration: Stream<AnimationEvent>;
    animationstart: Stream<AnimationEvent>;
    auxclick: Stream<MouseEvent>;
    blur: Stream<FocusEvent>;
    cancel: Stream<Event>;
    canplay: Stream<Event>;
    canplaythrough: Stream<Event>;
    change: Stream<Event>;
    click: Stream<MouseEvent>;
    close: Stream<Event>;
    contextmenu: Stream<MouseEvent>;
    cuechange: Stream<Event>;
    dblclick: Stream<MouseEvent>;
    drag: Stream<DragEvent>;
    dragend: Stream<DragEvent>;
    dragenter: Stream<DragEvent>;
    dragexit: Stream<Event>;
    dragleave: Stream<DragEvent>;
    dragover: Stream<DragEvent>;
    dragstart: Stream<DragEvent>;
    drop: Stream<DragEvent>;
    durationchange: Stream<Event>;
    emptied: Stream<Event>;
    ended: Stream<Event>;
    error: Stream<ErrorEvent>;
    focus: Stream<FocusEvent>;
    focusin: Stream<FocusEvent>;
    focusout: Stream<FocusEvent>;
    gotpointercapture: Stream<PointerEvent>;
    input: Stream<Event>;
    invalid: Stream<Event>;
    keydown: Stream<KeyboardEvent>;
    keypress: Stream<KeyboardEvent>;
    keyup: Stream<KeyboardEvent>;
    load: Stream<Event>;
    loadeddata: Stream<Event>;
    loadedmetadata: Stream<Event>;
    loadstart: Stream<Event>;
    lostpointercapture: Stream<PointerEvent>;
    mousedown: Stream<MouseEvent>;
    mouseenter: Stream<MouseEvent>;
    mouseleave: Stream<MouseEvent>;
    mousemove: Stream<MouseEvent>;
    mouseout: Stream<MouseEvent>;
    mouseover: Stream<MouseEvent>;
    mouseup: Stream<MouseEvent>;
    pause: Stream<Event>;
    play: Stream<Event>;
    playing: Stream<Event>;
    pointercancel: Stream<PointerEvent>;
    pointerdown: Stream<PointerEvent>;
    pointerenter: Stream<PointerEvent>;
    pointerleave: Stream<PointerEvent>;
    pointermove: Stream<PointerEvent>;
    pointerout: Stream<PointerEvent>;
    pointerover: Stream<PointerEvent>;
    pointerup: Stream<PointerEvent>;
    progress: Stream<ProgressEvent>;
    ratechange: Stream<Event>;
    reset: Stream<Event>;
    resize: Stream<UIEvent>;
    scroll: Stream<Event>;
    securitypolicyviolation: Stream<SecurityPolicyViolationEvent>;
    seeked: Stream<Event>;
    seeking: Stream<Event>;
    select: Stream<Event>;
    selectionchange: Stream<Event>;
    selectstart: Stream<Event>;
    stalled: Stream<Event>;
    // lib.dom.d.tsに存在しないため追加
    slotchange: Stream<Event>;
    submit: Stream<Event>;
    suspend: Stream<Event>;
    timeupdate: Stream<Event>;
    toggle: Stream<Event>;
    touchcancel: Stream<TouchEvent>;
    touchend: Stream<TouchEvent>;
    touchmove: Stream<TouchEvent>;
    touchstart: Stream<TouchEvent>;
    transitioncancel: Stream<TransitionEvent>;
    transitionend: Stream<TransitionEvent>;
    transitionrun: Stream<TransitionEvent>;
    transitionstart: Stream<TransitionEvent>;
    volumechange: Stream<Event>;
    waiting: Stream<Event>;
    wheel: Stream<WheelEvent>;
} & { [key:string]: Stream<Event> };

class VDOMConnection extends Map<VDOMObject, Listener> {

    private updated: VDOMUpdateHistory[];

    constructor() {
        super();
        this.updated = [];
    }

    registerCell(ctx: VDOMObject, cell: Cell<JSHTMLSource>) {
        this.get(ctx)?.unlisten();
        this.set(ctx, cell.listen((v) => this.reserveCellUpdate({
            target: ctx,
            newValue: v,
            oldValue: cell.valueOf()
        })));
    }

    unregisterCell(ctx: VDOMObject) {
        this.get(ctx)?.unlisten();
        this.delete(ctx);
    }

    garbageCollect(root: VDOMObject): void {
        Array.from(this.keys())
            .filter((c) => root.contains(c))
            .forEach((c) => this.unregisterCell(c));
    }

    reserveCellUpdate(upd: VDOMUpdateHistory) {
        if(this.updated.push(upd) !== 1) return;
        const exec_update = () => {
            while(this.updated.length)
                this.applyVDOMUpdate(this.updated.splice(0));
        };
        if(Transaction.currentTransaction.running)
            Transaction.onTransactionEnd(exec_update);
        else 
            exec_update();
    }

   applyVDOMUpdate(upd: VDOMUpdateHistory[]) {
        upd.filter(({target}) => upd.every((h) => target === h.target || !h.target.contains(target)))
            .forEach(({target,newValue,oldValue}) => {
                this.garbageCollect(target);
                target.update(newValue,oldValue);
            });
    }

}


abstract class VDOMObject {

    static connection = new VDOMConnection();

    abstract point : PointReference;
    abstract contains(o: VDOMObject) : boolean;
    abstract update(value: JSHTMLSource, old_value: JSHTMLSource) : void;

    protected registerCell(cell: Cell<JSHTMLSource>) {
        VDOMObject.connection.registerCell(this, cell);
    }

};


type VDOMUpdateHistory = {
    target: VDOMObject;
    newValue: JSHTMLSource;
    oldValue?: JSHTMLSource;
};

type VDOMPlaceholder = [Comment,Cell<NodeSource>];


type PointReference = Node | [Node,Node];


/**
    * 引数に渡された全てのオブジェクトのキーをマージ
    * @param o
    */
function mergePropertyNames(...o : any[]) : string[] {
    return o
        .reduce((a:string[],o) => { if(o) for(let k in o) a.push(k); return a; },[])
        .filter((k,i,a) => a.indexOf(k,i+1) === -1);
}

export const jshtml = (source: NodeSource) : JSHTML => new JSHTML(source);
export class JSHTML {

    public result: Comment | Text | HTMLElement | DocumentFragment;
    public placeholders: VDOMPlaceholder[];

    constructor(source: NodeSource) {
        let n;
        const p : VDOMPlaceholder[] = [];

        // Cell to Comment
        if (source instanceof Cell) {
            n = new Comment('[PLACEHOLDER]');
            p.push([n, source]);
        }

        else if (source instanceof Promise) {
            n = new Comment('[PLACEHOLDER]');
            const ctx = new NodeContext(n);
            source.then((s) => ctx.update(s));
        }

        else if (source instanceof Node)
            n = <HTMLElement> (source instanceof HTMLTemplateElement
                ? (<HTMLTemplateElement>source).content.cloneNode(true)
                : source);

        else if (Object(source) !== source)
            n = new Text(<string>source);

        // Array to Document Fragment
        else if (Array.isArray(source)) {
            if (!source.length)
                n = new Comment('[PLACEHOLDER]');
            else {
                const df = document.createDocumentFragment();
                source.forEach((s) => {
                    const r = jshtml(s);
                    df.appendChild(r.result);
                    if(r.placeholders.length)
                        p.push(...r.placeholders);
                });
                n = df;
            }
        }

        // primitive values to text
        // other object to element
        else for (let tag in <ElementSource>source) {
            if(tag === '$') continue;

            const attributes = (<ElementSource>source).$;
            const children_source = (<ElementSource>source)[<keyof HTMLElementTagNameMap>tag];

            n = document.createElement(tag);
            // apply attributes
            if (Object(attributes) === attributes)
                new AttributesContext(n).update(<AttributesSource>attributes);
            // add children
            if (children_source != null) {
                const child = new JSHTML(children_source);
                n.appendChild(child.result);
                if(child.placeholders)
                    p.push(...child.placeholders);
            }
        }

        if(!n) {
            console.log('invalid argument : cannot parse source object', source);
            throw new Error('invalid argument : cannot parse source object');
        }

        this.result = n;
        this.placeholders = p;
    }

}


class NodeContext extends VDOMObject {

    public parentContext?: NodeContext;
    public point: PointReference;

    constructor(point: PointReference, parent?: NodeContext) {
        super();
        this.point = point;
        this.parentContext = parent;
    }
    
    contains(target: VDOMObject): boolean {
        if (this === target || !(target instanceof VDOMObject))
            return false;

        const range = NodeContext.toRange(this.point);
        if (target instanceof AttrContext)
            return NodeContext.rangeContainsRange(range, NodeContext.toRange(target.point));

        if(!(target instanceof NodeContext) || !NodeContext.rangeContainsRange(range, NodeContext.toRange(target.point)))
            return false;

         // rangeが重なっていても、targetが祖先である可能性を弾く
        for(let c = this.parentContext; c; c = c.parentContext) if(c === target) return false;
        return true;
    }

    update(source: NodeSource): void {
        const {result,placeholders} = new JSHTML(source);

        const next_point = result.nodeType === Node.DOCUMENT_FRAGMENT_NODE
            ? <[Node,Node]>[result.firstChild, result.lastChild]
            : result;

        const range = NodeContext.toRange(this.point);
        const o = range.endOffset;
        range.insertNode(result);
        range.setStart(range.startContainer, range.startOffset + range.endOffset - o);
        range.deleteContents();

        placeholders.forEach(([n, source]) => new NodeContext(n, this).registerCell(source));

        this.point = next_point;
    }

    static toRange(p: PointReference) {
        const r = new Range();
        if (Array.isArray(p)) {
            r.setStartBefore(p[0]);
            r.setEndAfter(p[1]);
        } else {
            r.selectNode(p);
        }
        return r;
    }

    static rangeContainsRange(a:Range, b:Range) {
        return (a.compareBoundaryPoints(Range.START_TO_START, b) < 1 && a.compareBoundaryPoints(Range.END_TO_END, b) > -1);
    }

}


class AttributesContext extends VDOMObject {

    public point: HTMLElement;

    constructor(elm: HTMLElement) {
        super();
        this.point = elm;
    }

    contains(o: VDOMObject): boolean {
        return this.point === o.point && (o instanceof AttributesContext || o instanceof AttrContext);
    }

    update(v1: AttributesSource, v2: AttributesSource = {}): void {
        if(v1 instanceof Promise)
            v1.then((v) => this.update(v, v2));
        else if(v1 instanceof Cell)
            this.registerCell(v1);
        else 
            mergePropertyNames(v1,v2)
                .map((k) => new AttrContext(this.point, k))
                .forEach((ctx) => ctx.update(v1[ctx.name], v2[ctx.name]));
    }

}

class AttrContext extends VDOMObject {

    public point: HTMLElement;
    public name: string;

    constructor(element: HTMLElement, name: string) {
        super();
        this.point = element;
        this.name = name;
    }

    update(value: AttrValue, old_value: AttrValue) : void {
        const elm = this.point;
        const name = this.name;
        if (value instanceof Cell)
            this.registerCell(value);
        else if(value instanceof Promise)
            value.then((v) => this.update(v, old_value));
        else if (/^on./.test(name)) {
            if (this.validateEventListenable(old_value))
                elm.removeEventListener(name.slice(2), <EventListenerOrEventListenerObject>old_value, false);
            if (this.validateEventListenable(value))
                elm.addEventListener(name.slice(2), <EventListenerOrEventListenerObject>value, false);
        }
        else if (/^class(List)?$/.test(name)) {
            elm.className = Array.isArray(value)
                ? value.filter(Boolean).join(" ")
                : '' + value;
        }
        else if (/^(?:style|dataset)$/.test(name) && value instanceof Object) {
            mergePropertyNames(value, old_value)
                .map(name === 'style'
                    ? (k) : [StyleValueContext, AttrValue] =>
                                [new StyleValueContext(elm, StyleValueContext.camelToHyphenSeparated(k)), (<{[key:string]:AttrValue}>value)[k]]
                    : (k) : [DatasetValueContext, AttrValue] =>
                                [new DatasetValueContext(elm, DatasetValueContext.hyphenSeparatedToCamelize(k)), (<{[key:string]:AttrValue}>value)[k]])
                .forEach(([a,v]) => {
                    if(v instanceof Cell)
                        a.registerCell(v);
                    else
                        a.update(v);
                });
        }
        else if (value == null || value == '')
            elm.removeAttribute(name);
        else if (!(elm instanceof Component))
            elm[<"id">name] = <string>value;
        else
            elm.setAttribute(name, "" + value);
    }

    contains(o: VDOMObject): boolean {
        if(o === this || !(o instanceof AttrContext) || this.point !== o.point)
            return false;
        if (o instanceof StyleValueContext)
            return this.name === 'style';
        if (o instanceof DatasetValueContext)
            return this.name === 'dataset';
        return this.name === o.name;
    }

    /**
     * 引数がイベントリスナか判定する
     * @param value
     */
    protected validateEventListenable(value: any) : boolean {
       return value && (typeof value === "function" || typeof (<EventListenerObject>value).handleEvent === 'function');
    }


}

class StyleValueContext extends AttrContext {

    contains(o: VDOMObject): boolean {
        return o instanceof StyleValueContext && this.point === o.point && this.name === o.name && this !== o;
    }

    update(value: JSHTMLSource): void {
        if(value === null || value === undefined)
            this.point.style.removeProperty(this.name);
        else
            this.point.style.setProperty(this.name, value + '');
    }

    static camelToHyphenSeparated(str: string) {
        return str.replace(/[A-Z]/g, (s: string) => '-' + s.toLowerCase());
    }

}

class DatasetValueContext extends AttrContext {

    static hyphenSeparatedToCamelize = (str: string) =>
       str.replace(/-[a-z]/g, (s:string) => s.charAt(1).toUpperCase());

    contains(o: VDOMObject): boolean {
        return o instanceof DatasetValueContext && this.name === o.name && this !== o;
    }

    update(value: AttrValue): void {
        (<HTMLElement>this.point).dataset[this.name] = value == null ? '' : <string>value;
    }

}

const SHADOW = Symbol('SHADOW');

const ShadowEventStreamGetter = (target: ShadowEventMapObject, prop:string|number|symbol, receiver:any) => {
    if (target.hasOwnProperty(prop)) return Reflect.get(target,prop,receiver);
    const s = new StreamSink<Event>();
    Reflect.set(target, prop, s, receiver);
    Reflect.get(target, SHADOW, receiver).addEventListener(prop, target);
    return s;
};

type MutationStream = {
    observer: MutationObserver,
    characterData?: Stream<MutationRecord>;
    attributes?: Stream<MutationRecord>;
    childList?: Stream<MutationRecord>;
};

type ShadowEventMapObject = ShadowEventMap & {
    [SHADOW]: ShadowRoot;
    handleEvent(e: Event): void;
};

export abstract class Component extends HTMLElement implements WebComponentClass {
    
    abstract render() : NodeSource;

    public attrChanged : { [key:string]: Stream<string|null> };
    public shadowEvents: ShadowEventMap;
    public mutations? : MutationStream;

    private shadowContext: NodeContext;

    constructor() {
        super();
        const con = <WebComponentConstructor>this.constructor;
        const shadow = this.attachShadow({ mode: con.shadowOpen ? 'open' : 'closed' });
        this.attrChanged = {};
        this.shadowContext = new NodeContext(shadow.appendChild(new Comment('[PLACEHOLDER]')));
        this.shadowEvents = new Proxy(<ShadowEventMapObject>{
            [SHADOW]: shadow,
            handleEvent(e: Event) {
                (<StreamSink<Event>>this[e.type]).send(e);
            }
        }, <ProxyHandler<ShadowEventMapObject>> {
            get: ShadowEventStreamGetter
        });

        const mutation_init = (<WebComponentConstructor>this.constructor).observedMutation;
        if(!mutation_init) return;

        const m : MutationStream = {
            observer: new MutationObserver((r) => r.forEach((r) => (<StreamSink<MutationRecord>>m[r.type]).send(r)))
        };
        (['childList','attributes','characterData'] as MutationRecordType[])
            .filter((k) => mutation_init[k])
            .map((k) => m[k] = new StreamSink<MutationRecord>());
        this.mutations = m;
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        const changed = this.attrChanged;
        if(!changed.hasOwnProperty(name))
            changed[name] = new StreamSink();
        (<StreamSink<string|null>>changed[name]).send(newValue);
    }

    connectedCallback() {
        this.shadowContext.update(this.render());
        if(this.mutations)
            this.mutations.observer.observe(this,  (<WebComponentConstructor>this.constructor).observedMutation);
    }

    disconnectedCallback() {
        this.shadowContext.update(null);
        if(this.mutations)
            this.mutations.observer.disconnect();
    }

    get parentComponent() {
        let n = this.parentNode;
        while(n) {
            if(n instanceof Component) break;
            n = n instanceof ShadowRoot ? n.host : n.parentNode;
        }
        return n;
    }

}

export default {
    Stream,
    StreamLoop,
    StreamSink,
    Cell,
    CellSink,
    CellLoop,
    Transaction,
    Component
};
