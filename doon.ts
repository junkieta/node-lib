/*
 * "oimo" is frp library that inspired by "sodium".
 */
type HTMLAttrName =
    "abbr" | "accept" | "accept-charset" | "accesskey" | "action" | "allow" | "allowfullscreen" | "allowpaymentrequest" | "alt" | "as" | "async" | "autocapitalize" | "autocomplete" | "autofocus" | "autoplay" | "charset" | "checked" | "cite" | "class" | "color" | "cols" | "colspan" | "content" | "contenteditable" | "controls" | "coords" | "crossorigin" | "data" | "datetime" | "decoding" | "default" | "defer" | "dir" | "dir" | "dirname" | "disabled" | "download" | "draggable" | "enctype" | "enterkeyhint" | "for" | "form" | "formaction" | "formenctype" | "formmethod" | "formnovalidate" | "formtarget" | "headers" | "height" | "hidden" | "high" | "href" | "hreflang" | "http-equiv" | "id" | "imagesizes" | "imagesrcset" | "inputmode" | "integrity" | "is" | "ismap" | "itemid" | "itemprop" | "itemref" | "itemscope" | "itemtype" | "kind" | "label" | "lang" | "list" | "loop" | "low" | "manifest" | "max" | "max" | "maxlength" | "media" | "method" | "min" | "minlength" | "multiple" | "muted" | "name" | "nomodule" | "nonce" | "novalidate" | "open" | "optimum" | "pattern" | "ping" | "placeholder" | "playsinline" | "poster" | "preload" | "readonly" | "referrerpolicy" | "rel" | "required" | "reversed" | "rows" | "rowspan" | "sandbox" | "scope" | "selected" | "shape" | "size" | "sizes" | "slot" | "span" | "spellcheck" | "src" | "srcdoc" | "srclang" | "srcset" | "start" | "step" | "style" | "tabindex" | "target" | "title" | "translate" | "type" | "usemap" | "value";

type HTMLInputElementAttr =
    "accept"|"alt"|"autocomplete"|"autofocus"|"checked"|"dirname"|"disabled"|"formaction"|"formenctype"|"formmethod"|"formnovalidate"|"formtarget"|"height"|"max"|"maxlength"|"min"|"minlength"|"multiple"|"name"|"pattern"|"placeholder"|"readonly"|"required"|"size"|"src"|"step"|"type"|"value"|"width";

type HTMLInputBooleanAttr =
    "disabled"|"autofocus"|"required"|"checked"|"defaultChecked"|"indeterminate"|"readOnly"|"multiple";

type CSSPropertyName =
    { [P in keyof CSSStyleDeclaration]: CSSStyleDeclaration[P] extends CSSRule | Function ? never : P }[keyof CSSStyleDeclaration];

interface DOMEventListener<E extends Event> { (evt: E): void; }
interface DOMEventListenerObject<E extends Event> { handleEvent(evt: E) : void; }
type DOMEventListenable<E extends Event> = DOMEventListener<E> | DOMEventListenerObject<E> | string;

interface DOMEventHandlerMap {
    onfullscreenchange: DOMEventListenable<Event>;
    onfullscreenerror: DOMEventListenable<Event>;
    onabort: DOMEventListenable<UIEvent>;
    onanimationcancel: DOMEventListenable<AnimationEvent>;
    onanimationend: DOMEventListenable<AnimationEvent>;
    onanimationiteration: DOMEventListenable<AnimationEvent>;
    onanimationstart: DOMEventListenable<AnimationEvent>;
    onauxclick: DOMEventListenable<MouseEvent>;
    onblur: DOMEventListenable<FocusEvent>;
    oncancel: DOMEventListenable<Event>;
    oncanplay: DOMEventListenable<Event>;
    oncanplaythrough: DOMEventListenable<Event>;
    onchange: DOMEventListenable<Event>;
    onclick: DOMEventListenable<MouseEvent>;
    onclose: DOMEventListenable<Event>;
    oncontextmenu: DOMEventListenable<MouseEvent>;
    oncuechange: DOMEventListenable<Event>;
    ondblclick: DOMEventListenable<MouseEvent>;
    ondrag: DOMEventListenable<DragEvent>;
    ondragend: DOMEventListenable<DragEvent>;
    ondragenter: DOMEventListenable<DragEvent>;
    ondragexit: DOMEventListenable<Event>;
    ondragleave: DOMEventListenable<DragEvent>;
    ondragover: DOMEventListenable<DragEvent>;
    ondragstart: DOMEventListenable<DragEvent>;
    ondrop: DOMEventListenable<DragEvent>;
    ondurationchange: DOMEventListenable<Event>;
    onemptied: DOMEventListenable<Event>;
    onended: DOMEventListenable<Event>;
    onerror: DOMEventListenable<ErrorEvent>;
    onfocus: DOMEventListenable<FocusEvent>;
    onfocusin: DOMEventListenable<FocusEvent>;
    onfocusout: DOMEventListenable<FocusEvent>;
    ongotpointercapture: DOMEventListenable<PointerEvent>;
    oninput: DOMEventListenable<Event>;
    oninvalid: DOMEventListenable<Event>;
    onkeydown: DOMEventListenable<KeyboardEvent>;
    onkeypress: DOMEventListenable<KeyboardEvent>;
    onkeyup: DOMEventListenable<KeyboardEvent>;
    onload: DOMEventListenable<Event>;
    onloadeddata: DOMEventListenable<Event>;
    onloadedmetadata: DOMEventListenable<Event>;
    onloadstart: DOMEventListenable<Event>;
    onlostpointercapture: DOMEventListenable<PointerEvent>;
    onmousedown: DOMEventListenable<MouseEvent>;
    onmouseenter: DOMEventListenable<MouseEvent>;
    onmouseleave: DOMEventListenable<MouseEvent>;
    onmousemove: DOMEventListenable<MouseEvent>;
    onmouseout: DOMEventListenable<MouseEvent>;
    onmouseover: DOMEventListenable<MouseEvent>;
    onmouseup: DOMEventListenable<MouseEvent>;
    onpause: DOMEventListenable<Event>;
    onplay: DOMEventListenable<Event>;
    onplaying: DOMEventListenable<Event>;
    onpointercancel: DOMEventListenable<PointerEvent>;
    onpointerdown: DOMEventListenable<PointerEvent>;
    onpointerenter: DOMEventListenable<PointerEvent>;
    onpointerleave: DOMEventListenable<PointerEvent>;
    onpointermove: DOMEventListenable<PointerEvent>;
    onpointerout: DOMEventListenable<PointerEvent>;
    onpointerover: DOMEventListenable<PointerEvent>;
    onpointerup: DOMEventListenable<PointerEvent>;
    onprogress: DOMEventListenable<ProgressEvent>;
    onratechange: DOMEventListenable<Event>;
    onreset: DOMEventListenable<Event>;
    onresize: DOMEventListenable<UIEvent>;
    onscroll: DOMEventListenable<Event>;
    onsecuritypolicyviolation: DOMEventListenable<SecurityPolicyViolationEvent>;
    onseeked: DOMEventListenable<Event>;
    onseeking: DOMEventListenable<Event>;
    onselect: DOMEventListenable<Event>;
    onselectionchange: DOMEventListenable<Event>;
    onselectstart: DOMEventListenable<Event>;
    onstalled: DOMEventListenable<Event>;
    onsubmit: DOMEventListenable<Event>;
    onsuspend: DOMEventListenable<Event>;
    ontimeupdate: DOMEventListenable<Event>;
    ontoggle: DOMEventListenable<Event>;
    ontouchcancel: DOMEventListenable<TouchEvent>;
    ontouchend: DOMEventListenable<TouchEvent>;
    ontouchmove: DOMEventListenable<TouchEvent>;
    ontouchstart: DOMEventListenable<TouchEvent>;
    ontransitioncancel: DOMEventListenable<TransitionEvent>;
    ontransitionend: DOMEventListenable<TransitionEvent>;
    ontransitionrun: DOMEventListenable<TransitionEvent>;
    ontransitionstart: DOMEventListenable<TransitionEvent>;
    onvolumechange: DOMEventListenable<Event>;
    onwaiting: DOMEventListenable<Event>;
    onwheel: DOMEventListenable<WheelEvent>;
    oncopy: DOMEventListenable<ClipboardEvent>;
    oncut: DOMEventListenable<ClipboardEvent>;
    onpaste: DOMEventListenable<ClipboardEvent>;
}

type ElementSource = {
    $?: AttributesSource | Cell<AttributesSource>;
} & {
    [P in keyof HTMLElementTagNameMap]?: NodeSource;
};

type TextNodeSource =
    string | number | boolean | null | undefined;

type DocumentFragmentSource = NodeSource[];

type NodeSource =
    Node | TextNodeSource | DocumentFragmentSource | ElementSource | Cell<NodeSource>;

type AttrValue =
    undefined | null | string | boolean | number | string[] | Cell<AttrValue> | StyleSource | DatasetSource | DOMEventListenable<any>;

type StyleSource = {
    [P in CSSPropertyName]: Cell<string | number | null> | string | number | null;
};

type DatasetSource = {
    [key: string]: Cell<string | number | null> | string | number | null;
};

type AttributesSource = { [P in HTMLAttrName]?: AttrValue; } & Partial<DOMEventHandlerMap> & { [key : string]: AttrValue; };

type AttrSource =
    AttributesSource | StyleSource | DatasetSource;

type JSHTMLSource =
    NodeSource | AttrSource | AttrValue;

const _empty = () => { };

const PUSH = Symbol('PUSH');

interface Pushable {
    [PUSH]: Function;
}

// lift,CellSink,StreamSinkによるプッシュを実装するための関数。
const _run_continue = (callback: () => any) => {
    const action = () => Transaction.currentTransaction.push(callback);
    if (Transaction.currentTransaction.running)
        action();
    else
        Transaction.run(action);
};

export class Transaction extends Array<Function> {

    static currentTransaction = new Transaction;
    private static cellUpdates = [] as Function[];
    private static endCallback = [] as Function[];

    static run<A>(callback: () => A): A {
        const execute = (f:Function[]) => { while(f.length) f.splice(0).forEach((f) => f()) };
        const tr_previous = Transaction.currentTransaction;
        const tr = Transaction.currentTransaction = new Transaction();

        tr.running = true;
        const result = callback();
        const f = [tr, Transaction.cellUpdates, Transaction.endCallback];
        while (f.some((f) => f.length)) f.forEach(execute);
        tr.running = false;

        Transaction.currentTransaction = tr_previous;
        return result;
    }

    static enqueueUpdateCell(callback: Function) {
        Transaction.cellUpdates.push(callback);
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
 * Stream,Cellの接続を処理する。
 * */
export const Pipeline = {

    _connections: new WeakMap<Pushable, Pushable | Pushable[]>(),

    connect(source: Pushable, destination: Pushable): void {
        const conn = this._connections;
        const current = conn.get(source);
        if (current === undefined) {
            conn.set(source, destination);
        } else if (Array.isArray(current)) {
            if (current.find((p: Pushable) => p === destination)) return;
            conn.set(source, current.concat(destination));
        } else if (current !== destination) {
            conn.set(source, [current, destination]);
        }
    },

    disconnect(source: Pushable, destination: Pushable): void {
        const conn = this._connections;
        if (!conn.has(source)) return;
        const current = conn.get(source);
        if (!Array.isArray(current)) {
            if (current === destination)
                conn.delete(source);
            return;
        }
        const i = current.indexOf(destination);
        if (i === -1) return;
        current.splice(i, 1);
        if (current.length === 1)
            conn.set(source, current[0]);
        else if (!current.length)
            conn.delete(source);
    },

    getConnections(source: Pushable): Pushable[] {
        const item = this._connections.get(source);
        return Array.isArray(item)
            ? item
            : item === undefined
                ? []
                : [item];
    }

};

/**
 * listenから返されるオブジェクト。
 * */
export class Listener implements Pushable {

    [PUSH]: Function;
    private _unlisten: Function;

    constructor(f1?: Function, f2?: Function) {
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

export class Stream<A> implements Pushable {

    static PASS_THROUGH<A>(value: A): A {
        return value;
    }

    private _apply: (value: any) => A;

    constructor(callback?: (value: any) => A) {
        this._apply = typeof callback === 'function' ? callback : never._apply;
    }

    [PUSH](value: any) {
        try {
            const r = this._apply(value);
            Pipeline.getConnections(this).forEach(c => c[PUSH](r));
        } catch (err) {
            if (!(err instanceof StreamingError)) throw err;
        }
    }

    /**
     * 値の受け取りを監視するListenerを返す。
     * @param handler
     */
    listen(handler: (value: A) => void): Listener {
        const l = new Listener(handler, () => Pipeline.disconnect(this, l));
        Pipeline.connect(this, l);
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
    map<B>(action: (arg: A) => B): Stream<B> {
        const s = new Stream(action);
        Pipeline.connect(this, s);
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
        Pipeline.connect(this, c);
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


export class Cell<A> implements Pushable {

    static switchC<A>(cell: Cell<Cell<A>>): Cell<A> {
        const s = new Stream<A>(Stream.PASS_THROUGH);
        cell.listen((v) => {
            Pipeline.disconnect(cell.valueOf(), s);
            Pipeline.connect(v, s);
            s[PUSH](v.valueOf());
        });
        return s.hold(cell.valueOf().valueOf());
    }

    static switchS<A>(cell: Cell<Stream<A>>): Stream<A> {
        const s = new Stream(Stream.PASS_THROUGH);
        cell.listen((v) => {
            Pipeline.disconnect(cell.valueOf(), s);
            Pipeline.connect(v, s);
        });
        return s;
    }

    private _value: A;
    private _stream: Stream<A>;

    constructor(init: A, stream: Stream<A> = never) {
        this._value = init;
        this._stream = stream;
    }

    /**
     * 現在のトランザクション終了時に値が代入されるようにする。
     */
    [PUSH](value: A): void {
        Transaction.enqueueUpdateCell(() => this._value = value);
        Pipeline.getConnections(this).forEach(c => c[PUSH](value));
    }

    /**
     * listenerを登録する。Streamとは違い、初期値があるので即座に一度発火する。
     */
    listen(action: (v: A) => void): Listener {
        const l = new Listener(action, () => Pipeline.disconnect(this, l));
        Pipeline.connect(this, l);
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
    lift<B,C>(that: Cell<B>, lambda: (a:A,b:B) => C) : Cell<C>;
    lift<B,C,D,E,F>(that: [Cell<B>,Cell<C>?,Cell<D>?,Cell<E>?], f?: (a:A,b:B,c:C,d:D,e:E) => F): Cell<F>;
    lift<B>(that: any, lambda: (...value: any[]) => B): Cell<B> {
        const stream = new Stream<B>(Stream.PASS_THROUGH);
        const cells = (<Cell<any>[]>[this]).concat(<Cell<any>>that);
        const values = [] as any[];

        let update_flag = true;
        cells.forEach((c, i) => c.listen((v) => {
            values[i] = v;
            if (update_flag) return;
            update_flag = true;
            _run_continue(push);
        }));
        update_flag = false;

        return stream.hold(lambda(...values));

        function push() {
            stream[PUSH](lambda(...values));
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

    private origin: Stream<A> | null;

    constructor() {
        if(!Transaction.currentTransaction.running)
            throw new Error('StreamLoopはトランザクション中にしか作成できません');
        super(Stream.PASS_THROUGH);
        this.origin = null;
        Transaction.onTransactionEnd(() => {
            if(!this.origin) throw new Error('StreamLoopはトランザクションの終了前に loop メソッドを呼び出す必要があります');
        });
    }

    loop(out: Stream<A>) {
        if(this.origin) throw new Error('loopメソッドは既に呼び出し済みです');
        this.origin = out;
        Pipeline.connect(out, this);
    }

}

export class CellLoop<A> extends Cell<A> {

    static BEFORE_INIT = Symbol('before_init');

    private origin: Cell<A> | null;

    constructor() {
        if(!Transaction.currentTransaction.running)
            throw new Error('CellLoopはトランザクション中にしか作成できません');
        super(<any>CellLoop.BEFORE_INIT, new Stream<A>(Stream.PASS_THROUGH));
        this.origin = null;
        Transaction.onTransactionEnd(() => {
            if(!this.origin) throw new Error('CellLoopはトランザクションの終了前に loop メソッドを呼び出す必要があります');
        });
    }

    listen(action: (v:A) => void) : Listener {
        const l = new Listener(action, () => Pipeline.disconnect(this, l));
        Pipeline.connect(this, l);
        if(this.origin) action(this.valueOf());
        return l;
    }

    loop(out: Cell<A>) {
        if (this.origin) throw new Error('loopメソッドは既に呼び出し済みです')
        this.origin = out;
        Pipeline.connect(out, this);
    }

    valueOf() {
        return this.origin ? this.origin.valueOf() : super.valueOf();
    }

}

export class StreamSink<A> extends Stream<A> {

    private _queue: A[];

    static valueOfLast<A>(values: A[]): A {
        return values[values.length - 1];
    }

    constructor(colease?: (...values: A[]) => A) {
        super(colease
            ? (values: A[]) => values.length > 1 ? colease(...values) : values[0]
            : StreamSink.valueOfLast);
        this._queue = [];
    }

    send(value: A) {
        if (this._queue.push(value) === 1)
            _run_continue(() => this[PUSH](this._queue.splice(0)));
    }

}

export class CellSink<A> extends Cell<A> {

    private _queue: A[];
    private _action: (values: A[]) => A;

    static takeFirstArg<A>(values: A[]): A {
        return values[0];
    }

    constructor(init: A, colease?: (...value: A[]) => A) {
        super(init);
        this._queue = [];
        this._action = colease
            ? (values: A[]) => colease(...values)
            : CellSink.takeFirstArg;
    }

    send(value: A) {
        if (this._queue.push(value) === 1)
            _run_continue(() => this[PUSH](this._action(this._queue.splice(0))));
        else if(this._action === CellSink.takeFirstArg)
            throw new Error('already sent value / join-function isnot initialized');
    }

}

const _keys = (o: Object): string[] => {
    const a = [];
    // Object.keysではなく、継承元のプロパティも列挙させるためにfor-inループを使う
    for (let k in o) a[a.length] = k;
    return a;
};


const JSHTMLADOPTER_SINGLETON = Symbol('JSHTMLADOPTER_SINGLETON');
/**
 * JSHTML構造に組み込まれたCellの更新を管理する。
 * */
class JSHTMLAdopter {

    static [JSHTMLADOPTER_SINGLETON]: JSHTMLAdopter | null = null;

    static singleton() : JSHTMLAdopter {
        return JSHTMLAdopter[JSHTMLADOPTER_SINGLETON] || (JSHTMLAdopter[JSHTMLADOPTER_SINGLETON] = new JSHTMLAdopter());
    }

    private updated : [JSHTMLObject,JSHTMLSource,JSHTMLSource][] = [];
    private contexts: Map<JSHTMLObject, Listener>;

    constructor() {
        if(JSHTMLAdopter[JSHTMLADOPTER_SINGLETON])
            throw new Error('use static::singleton()');
        this.contexts = new Map();
    }

    register(ctx: JSHTMLObject, cell: Cell<JSHTMLSource>) {
        this.contexts.get(ctx)?.unlisten();
        this.contexts.set(ctx, 
            cell.listen((v) => this.reserveUpdate(ctx,v,cell.valueOf())));
    }

    unregister(ctx: JSHTMLObject) {
        this.contexts.get(ctx)?.unlisten();
        this.contexts.delete(ctx);
    }

    garbageCollect(root: JSHTMLObject): void {
        Array.from(this.contexts.keys())
            .filter((c) => root.contains(c))
            .forEach((c) => this.unregister(c));
    }

    reserveUpdate(context: JSHTMLObject, new_value: JSHTMLSource, old_value: JSHTMLSource) {
        if(this.updated.push([context,new_value,old_value]) !== 1)
            return;
        if(Transaction.currentTransaction.running)
            Transaction.onTransactionEnd(() => {
                while(this.updated.length)
                    this.applyUpdate(this.updated.splice(0));
            });
        else 
            while(this.updated.length)
                this.applyUpdate(this.updated.splice(0));
    }

    applyUpdate(upd: [JSHTMLObject,JSHTMLSource,JSHTMLSource][]) {
        upd.filter(([ctx1]) => upd
            .every(([ctx2]) => ctx1 === ctx2 || !ctx2.contains(ctx1)))
            .forEach(([ctx,v1,v2]) => {
                this.garbageCollect(ctx);
                ctx.update(v1,v2);
            });
    }

}

abstract class JSHTMLObject {
    public parent?: JSHTMLObject;
    abstract contains(context: JSHTMLObject) : boolean;
    abstract update(v1: JSHTMLSource, v2?: JSHTMLSource) : void;
}

class JSHTMLNode extends JSHTMLObject {

    public doc: Document;
    public range: Range;
    private placeholders: [Node, Cell<NodeSource>][];

    constructor(point: Node | Range, parent?: JSHTMLNode) {
        super();
        this.placeholders = [];
        this.parent = parent;
        if (point instanceof Node) {
            this.doc = <Document>point.ownerDocument;
            this.range = new Range();
            this.range.selectNode(point);
        } else {
            this.range = point;
            this.doc = <Document>point.startContainer?.ownerDocument;
        }
    }
    
    contains(target: JSHTMLObject): boolean {
        const contains = JSHTMLNode.a_contains_b;
        if (this === target || !(target instanceof JSHTMLObject))
            return false;
        if (target instanceof JSHTMLAttrBase) {
            const b = new Range();
            b.selectNode(target.element);
            return contains(this.range, b);
        }
        if(!(target instanceof JSHTMLNode) || !contains(this.range, target.range))
            return false;
        // rangeが重なっていても、targetが祖先である可能性を弾く
        for(let c : JSHTMLObject | undefined = this.parent; c; c = c.parent)
            if(c === target)
                return false;
        return true;
    }

    update(v: NodeSource): void {
        const r1 = this.range;
        const o = r1.endOffset;
        const result = this.build(v);
        r1.insertNode(result);

        const r2 = r1.cloneRange();
        r2.setStart(r2.startContainer, r2.startOffset + r2.endOffset - o);
        r2.deleteContents();
        r2.detach();

        while (this.placeholders.length) {
            this.placeholders
                .splice(0)
                .forEach(([n, source]) => JSHTMLAdopter.singleton().register(new JSHTMLNode(n, this), source));
        }
    }

    build(source: NodeSource): Comment | DocumentFragment | HTMLElement | Text {
        if (source instanceof Node) {
            return <DocumentFragment>(source instanceof HTMLTemplateElement ? source.content : source).cloneNode(true);
        }
        // Cell to Comment
        if (source instanceof Cell) {
            const c = this.doc.createComment('[PLACEHOLDER]');
            // placeholder は update メソッド内で読みだされる
            this.placeholders.push([c, source]);
            return c;
        }
        // Array to Document Fragment
        if (Array.isArray(source)) {
            if (!source.length) return this.doc.createComment('[PLACEHOLDER]');
            const df = this.doc.createDocumentFragment();
            source.map((v: any) => this.build(v))
                .forEach((n: Node) => df.appendChild(n));
            return df;
        }
        // primitive values to text
        if (Object(source) !== source) {
            return this.doc.createTextNode(<string>source);
        }
        // other object to element
        return this.buildElement(<ElementSource> source);
    }

    protected buildElement<K extends keyof HTMLElementTagNameMap>(source: ElementSource): HTMLElementTagNameMap[K] {
        const tag = <K>_keys(source).find((key: string) => key !== '$');
        if (!tag) 
            throw new Error('invalid argument : cannot parse source object');
        const
            elm = this.doc.createElement(tag),
            children = <NodeSource> source[tag],
            attributes = <AttributesSource> source.$;
        if (children !== null)
            elm.appendChild(this.build(children));
        if (!attributes) return elm;
        // set attributes
        const context = new JSHTMLAttributes(elm);
        if (attributes instanceof Cell)
            JSHTMLAdopter.singleton().register(context, attributes);
        else
            context.update(attributes, {});
        return elm;
    }

    static a_contains_b(a:Range, b: Range) {
        return a === b ||
            (a.compareBoundaryPoints(Range.START_TO_START, b) < 1 &&
                a.compareBoundaryPoints(Range.END_TO_END, b) > -1);
    }

}

abstract class JSHTMLAttrBase extends JSHTMLObject {

    static merge_keys(...o: any[]) {
        return o
            .filter((o: any) => Object(o) === o)
            .flatMap(_keys)
            .filter((k,i,arr) => arr.indexOf(k,i+1) === -1);
    }

    protected static applyContext(
        context: JSHTMLAttrBase,
        values: { [key:string]: AttrValue } = {},
        old_values: { [key: string]: AttrValue } = {}
    ) {
        const v1 = values[context.name], v2 = old_values[context.name];
        if (v1 instanceof Cell)
            JSHTMLAdopter.singleton().register(context, v1);
        else
            context.update(v1, v2);
    }

    public element: Element;
    public name: string;

    constructor(element: Element, name: string) {
        super();
        this.element = element;
        this.name = name;
    }

    contains(context: JSHTMLObject) {
        return context !== this && context instanceof JSHTMLAttrBase && this.element === context.element;
    }

}

class JSHTMLAttributes extends JSHTMLAttrBase {

    constructor(element: Element) {
        super(element, "attributes");
    }

    update(value: AttributesSource, old: AttributesSource): void {
        JSHTMLAttrBase
            .merge_keys(value, old)
            .forEach((k: string) =>
                JSHTMLAttrBase.applyContext(new JSHTMLAttr(this.element, k), value, old));
    }

}

class JSHTMLAttr extends JSHTMLAttrBase {

    static INPUT_PROPERTIES = {
        // boolean attributes
        disabled: true,
		autofocus: true,
		required: true,
		checked: true,
		defaultChecked: true,
		indeterminate: true,
		readOnly: true,
		multiple: true,
        // other
        name: false,
	    value: false,
        defaultValue: false,
	    placeholder: false,
	    pattern: false,
	    min: false,
	    max: false,
    }

    static is_listener(value: any): boolean {
        return value != null &&
            (typeof value === 'function' || typeof (<EventListenerObject>value).handleEvent === 'function');
    }

    update(value: AttrValue, old_value: AttrValue) : void {
        const elm = this.element, name = <HTMLAttrName | "dataset">this.name;
        if(name === 'class' && Array.isArray(value))
            return this.update(value.filter(Boolean).join(' '), old_value);
        if (/^on./.test(name)) {
            if (JSHTMLAttr.is_listener(old_value))
                elm.removeEventListener(name.slice(2), <EventListenerOrEventListenerObject>old_value, false);
            if (JSHTMLAttr.is_listener(value))
                elm.addEventListener(name.slice(2), <EventListenerOrEventListenerObject>value, false);
        }
        else if (name === 'style' || name === 'dataset')
            JSHTMLAttrBase
                .merge_keys(value, old_value)
                .map(name === 'style'
                    ? (key) => new JSHTMLStyleAttr(elm, key)
                    : (key) => new JSHTMLDataset(elm, key))
                .forEach((context) =>
                    JSHTMLAttrBase
                        .applyContext(context, <StyleSource | DatasetSource>value, <StyleSource | DatasetSource>old_value));
        // setAttributeを使った場合、input要素の属性変更はビューに反映されないバグがある(only firefox ?)
        else if (/^(?:INPUT|BUTTON)$/i.test(elm.tagName))
            this.updateInputElement(value);
        else if (value == null || value == '')
            elm.removeAttribute(name);
        else if (Object(value) !== value)
            elm.setAttribute(name, <string>value);
    }

    updateInputElement(value: AttrValue) : void {
        const elm = <HTMLInputElement> this.element, name = <HTMLInputElementAttr>this.name;
        if(JSHTMLAttr.INPUT_PROPERTIES.hasOwnProperty(name))
            elm[<HTMLInputBooleanAttr>name] = <boolean> value;
        else if(value == null || value === false)
            elm.removeAttribute(name.toLowerCase());
        else
            elm.setAttribute(name.toLowerCase(), value === true ? name.toLowerCase() : <string>value);
    }

    contains(context: JSHTMLObject): boolean {
        if (!super.contains(context))
            return false;
        if (context instanceof JSHTMLAttr)
            return this.name === context.name;
        if (context instanceof JSHTMLStyleAttr)
            return this.name === 'style';
        if (context instanceof JSHTMLDataset)
            return this.name === 'dataset';
        return false;
    }

}

class JSHTMLStyleAttr extends JSHTMLAttrBase {

    /**
     * キャメルからハイフン区切りに変換する(ex: zIndex -> z-index)
     */
    static camelToHyphenSeparated(str: string) {
        return str.replace(/[A-Z]/g, (s: string) => '-' + s.toLowerCase());
    }

    contains(context: JSHTMLObject): boolean {
        return super.contains(context) && context instanceof JSHTMLStyleAttr && this.name === context.name;
    }

    update(value: AttrValue): void {
        const name = JSHTMLStyleAttr.camelToHyphenSeparated(this.name);
        const css = (<HTMLElement>this.element).style;
        if (value == null)
            css.removeProperty(name);
        else
            css.setProperty(name, <string>value);
    }

}

class JSHTMLDataset extends JSHTMLAttrBase {

    static camelize = (str: string) =>
       str.replace(/-[a-z]/g, (s:string) => s.charAt(1).toUpperCase());

    contains(context: JSHTMLObject): boolean {
        return super.contains(context) && context instanceof JSHTMLDataset && this.name === context.name;
    }

    update(value: AttrValue): void {
        (<HTMLElement>this.element).dataset[JSHTMLDataset.camelize(this.name)] = value == null ? '' : <string>value;
    }

}

/**
 * DOM EventをStreamに変換するクラス。
 * JSHTML内でイベントハンドラ(onclick, onkeydown等)の属性値として設置することで稼働する。
 */
export class EventStream<E extends Event> extends StreamSink<E> implements EventListenerObject {

    bind(event: string | string[], target: EventTarget = document) : EventStream<E> {
        if (typeof event === 'string')
            target.addEventListener(event, this, false);
        else
            event.forEach((type) => target.addEventListener(type, this));
        return this;
    }

    unbind(event: string | string[], target: EventTarget = document): EventStream<E> {
        if (typeof event === 'string')
            target.removeEventListener(event, this, false);
        else
            event.forEach((type) => target.removeEventListener(type, this, false));
        return this;
    }

    handleEvent(evt: E): void {
        this.send(evt);
    }

}

export abstract class Component extends HTMLElement {

    abstract render() : NodeSource;

    public events: EventStream<Event>;
    private context? : JSHTMLNode;

    constructor() {
        super();
        this.events = new EventStream;
    }

    parentComponent() : Component | null {
        const n = this.parentNode;
        if(!n)
            return null;
        if(!(n instanceof ShadowRoot)) 
            return this.parentComponent.call(n);
        if(n.host instanceof Component)
            return n.host;
        return this.parentComponent.call(n.host);
    }

    get observedEvents() : string[] {
        return [];
    }

    connectedCallback() {
        if(this.context) return;
        const shadow = this.attachShadow({ mode : "open" });
        this.observedEvents.forEach((e) => shadow.addEventListener(e, this.events));
        const range = new Range();
        range.selectNodeContents(shadow);
        this.context = new JSHTMLNode(range);
        this.context.update(this.render());
    }

    disconnectedCallback() {
        const shadow = this.shadowRoot;
        if(shadow)
            this.observedEvents.forEach((e) => shadow.removeEventListener(e, this.events));
    }

}


export default {
    Component,
    Transaction,
    Stream,
    Cell,
    StreamSink,
    CellSink,
    Pipeline,
    EventStream,
};
