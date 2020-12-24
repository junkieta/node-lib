/*
 * "doon" is frp library that inspired by "sodium".
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

export type ElementSource = {
    $?: AttributesSource | Cell<AttributesSource>;
} & {
    [P in keyof HTMLElementTagNameMap]?: NodeSource;
};

export type TextNodeSource =
    string | number | boolean | null | undefined;

export type DocumentFragmentSource = NodeSource[];

export type NodeSource =
    Node | TextNodeSource | DocumentFragmentSource | ElementSource | Cell<NodeSource>;

export type AttrValue =
    undefined | null | string | boolean | number | string[] | Cell<AttrValue> | StyleSource | DatasetSource | DOMEventListenable<any>;

export type StyleSource = {
    [P in CSSPropertyName]: Cell<string | number | null> | string | number | null;
};

export type DatasetSource = {
    [key: string]: Cell<string | number | null> | string | number | null;
};

export type AttributesSource = { [P in HTMLAttrName]?: AttrValue; } & Partial<DOMEventHandlerMap> & { [key : string]: AttrValue; };

export type AttrSource =
    AttributesSource | StyleSource | DatasetSource;

export type JSHTMLSource =
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

abstract class DoonObject {
    public ownerDocument?: DoonDocument;
    abstract contains(o: DoonObject) : boolean;
    abstract update(value: JSHTMLSource, old_value: JSHTMLSource) : void;
};

class DoonDocument {

    public originalDoc: Document;
    public rootNode: DoonNode;
    public placeholder: [Comment,Cell<JSHTMLSource>][];
    protected connection: Map<DoonObject, Listener>;
    protected updated: [DoonObject,JSHTMLSource,JSHTMLSource][];

    constructor(root: ShadowRoot) {
        this.originalDoc = root.ownerDocument;
        this.placeholder = [];
        this.connection = new Map();
        this.updated = [];

        const range = new Range();
        range.selectNodeContents(root);

        this.rootNode = new DoonNode(this, range);
    }

    createNode(source: NodeSource) {
        // Cell to Comment
        if (source instanceof Cell) {
            const comment = this.originalDoc.createComment('[PLACEHOLDER]');
            this.placeholder.push([comment, source]);
            return comment;
        }
        if (source instanceof Node) {
            return <DocumentFragment>(source instanceof HTMLTemplateElement ? source.content : source).cloneNode(true);
        }
        // Array to Document Fragment
        if (Array.isArray(source)) {
            if (!source.length)
                return this.originalDoc.createComment('[PLACEHOLDER]');
            const df = this.originalDoc.createDocumentFragment();
            source.map((v: any) => this.createNode(v))
                .forEach((n: Node) => df.appendChild(n));
            return df;
        }
        // primitive values to text
        if (Object(source) !== source) {
            return this.originalDoc.createTextNode(<string>source);
        }
        // other object to element
        for (let tag in <ElementSource> source) {
            if(tag === '$') continue;
            const
                elm = this.originalDoc.createElement(tag),
                children = (<{[tag:string]:NodeSource}>source)[tag],
                attributes = (<{$:AttributesSource}>source).$;
            // add children
            if (children !== null)
                elm.appendChild(this.createNode(children));
            // apply attributes
            if (Object(attributes) !== attributes) 
                return elm;
            if (attributes instanceof Cell)
                this.registerCell(new DoonAttributes(this, elm), attributes);
            else
                DoonDocument.mergePropertyNames(attributes)
                    .forEach((k) => this.applyAttr(elm, k, attributes[k]));
            return elm;
        }
        throw new Error('invalid argument : cannot parse source object');
    }

    applyAttr(elm: HTMLElement, name: string, value: AttrValue, old_value?: AttrValue) {
        if (value instanceof Cell)
            this.registerCell(new DoonAttr(this, elm, name), value);
        else if (/^on./.test(name)) {
            if (this.validateEventListenable(old_value))
                elm.removeEventListener(name.slice(2), <EventListenerOrEventListenerObject>old_value, false);
            if (this.validateEventListenable(value))
                elm.addEventListener(name.slice(2), <EventListenerOrEventListenerObject>value, false);
        }
        else if (Object(value) === value) {
            if (name === 'class') {
                elm.className = Array.isArray(value)
                    ? value.join(" ")
                    : '' + value;
            } else if (/^style|dataset$/.test(name)) {
                DoonDocument
                    .mergePropertyNames(value, old_value)
                    .map(name === 'style'
                        ? (k) : [DoonStyleValue, AttrValue] =>
                                    [new DoonStyleValue(this, elm, DoonStyleValue.camelToHyphenSeparated(k)), (<{[key:string]:AttrValue}>value)[k]]
                        : (k) : [DoonDatasetValue, AttrValue] =>
                                    [new DoonDatasetValue(this, elm, DoonDatasetValue.hyphenSeparatedToCamelize(k)), (<{[key:string]:AttrValue}>value)[k]])
                    .forEach(([a,v]) => {
                        if(v instanceof Cell)
                            this.registerCell(a, v);
                        else
                            a.update(v);
                    });
            }
        }
        else if (name in Object.getPrototypeOf(elm))
            elm[<"id">name] = <string>value;
        else if (value == null || value == '')
            elm.removeAttribute(name);
        else
            elm.setAttribute(name, value + '');
    }

    registerCell(ctx: DoonObject, cell: Cell<JSHTMLSource>) {
        this.connection.get(ctx)?.unlisten();
        this.connection.set(ctx, cell.listen((v) => this.reserveCellUpdate(ctx,v,cell.valueOf())));
    }

    unregisterCell(ctx: DoonObject) {
        this.connection.get(ctx)?.unlisten();
        this.connection.delete(ctx);
    }

    garbageCollect(root: DoonObject): void {
        Array.from(this.connection.keys())
            .filter((c) => root.contains(c))
            .forEach((c) => this.unregisterCell(c));
    }

    reserveCellUpdate(context: DoonObject, new_value: JSHTMLSource, old_value: JSHTMLSource) {
        if(this.updated.push([context,new_value,old_value]) !== 1) return;
        const exec_update = () => {
            while(this.updated.length) this.applyCellUpdate(this.updated.splice(0));
        };
        if(Transaction.currentTransaction.running)
            Transaction.onTransactionEnd(exec_update);
        else 
            exec_update();
    }

    applyCellUpdate(upd: [DoonObject, JSHTMLSource, JSHTMLSource][]) {
        upd.filter(([ctx1]) => upd.every(([ctx2]) => ctx1 === ctx2 || !ctx2.contains(ctx1)))
            .forEach(([ctx,v1,v2]) => {
                this.garbageCollect(ctx);
                ctx.update(v1,v2);
            });
    }

    /**
     * 引数がイベントリスナか判定する
     * @param value
     */
    protected validateEventListenable(value: any) : boolean {
       return value && (typeof value === "function" || typeof (<EventListenerObject>value).handleEvent === 'function');
    }

    /**
     * 引数に渡された全てのオブジェクトのキーをマージ
     * @param o
     */
    static mergePropertyNames(...o : any[]) : string[] {
        return o
            .flatMap((o) => { const result : string[] = []; if(o) for(let k in o) result.push(k); return result; })
            .filter((k,i,a) => a.indexOf(k,i+1) === -1);
    }

}

class DoonNode extends DoonObject {

    public parent?: DoonNode;
    public range: Range;

    constructor(doc : DoonDocument, point: Node | Range, parent?: DoonNode) {
        super();
        this.ownerDocument = doc;
        this.parent = parent;
        if (point instanceof Node) {
            this.range = new Range();
            this.range.selectNode(point);
        } else {
            this.range = point;
        }
    }
    
    contains(target: DoonObject): boolean {
        const contains = DoonNode.a_contains_b;
        if (this === target || !(target instanceof DoonObject))
            return false;
        if (target instanceof DoonAttr) {
            const b = new Range();
            b.selectNode(target.element);
            return contains(this.range, b);
        }
        if(!(target instanceof DoonNode) || !contains(this.range, target.range))
            return false;
        // rangeが重なっていても、targetが祖先である可能性を弾く
        for(let c = this.parent; c; c = c.parent) if(c === target) return false;
        return true;
    }

    update(v: NodeSource): void {
        const doc = <DoonDocument>this.ownerDocument;
        const r1 = this.range;
        const o = r1.endOffset;
        r1.insertNode(doc.createNode(v));

        const r2 = r1.cloneRange();
        r2.setStart(r2.startContainer, r2.startOffset + r2.endOffset - o);
        r2.deleteContents();
        r2.detach();

        while (doc.placeholder.length) {
            doc.placeholder
                .splice(0)
                .forEach(([n, source]) => doc.registerCell(new DoonNode(doc, n, this), source));
        }

    }

    static a_contains_b(a:Range, b: Range) {
        return a === b ||
            (a.compareBoundaryPoints(Range.START_TO_START, b) < 1 &&
                a.compareBoundaryPoints(Range.END_TO_END, b) > -1);
    }

}

class DoonAttributes extends DoonObject {

    public element: HTMLElement;

    constructor(doc: DoonDocument, elm: HTMLElement) {
        super();
        this.ownerDocument = doc;
        this.element = elm;
    }

    contains(o: DoonObject): boolean {
        return this.ownerDocument === o.ownerDocument
            && this.element === (<{element?:HTMLElement}>o).element
            && (o instanceof DoonAttributes || o instanceof DoonAttr);
    }

    update(v1: AttributesSource, v2: AttributesSource = {}): void {
        DoonDocument.mergePropertyNames(v1,v2)
            .forEach((k) => (<DoonDocument>this.ownerDocument).applyAttr(this.element, k, v1[k], v2[k]));
    }

}

class DoonAttr extends DoonObject {

    public element: HTMLElement;
    public name: string;

    constructor(doc: DoonDocument, element: HTMLElement, name: string) {
        super();
        this.ownerDocument = doc;
        this.element = element;
        this.name = name;
    }

    update(value: AttrValue, old_value: AttrValue) : void {
        (<DoonDocument>this.ownerDocument).applyAttr(this.element, this.name, value, old_value);
    }

    contains(o: DoonObject): boolean {
        if (o === this)
            return false;
        if (o instanceof DoonStyleValue)
            return this.name === 'style';
        if (o instanceof DoonDatasetValue)
            return this.name === 'dataset';
        if (o instanceof DoonAttr)
            return this.name === o.name;
        return false;
    }
}

class DoonStyleValue extends DoonAttr {

    contains(o: DoonObject): boolean {
        return this !== o && o instanceof DoonStyleValue && this.element === o.element && this.name === o.name;
    }

    update(value: JSHTMLSource): void {
        if(value === null || value === undefined)
            this.element.style.removeProperty(this.name);
        else
            this.element.style.setProperty(this.name, value + '');
    }

    /**
     * キャメルからハイフン区切りに変換する(ex: zIndex -> z-index)
     */
    static camelToHyphenSeparated(str: string) {
        return str.replace(/[A-Z]/g, (s: string) => '-' + s.toLowerCase());
    }

}

class DoonDatasetValue extends DoonAttr {

    static hyphenSeparatedToCamelize = (str: string) =>
       str.replace(/-[a-z]/g, (s:string) => s.charAt(1).toUpperCase());

    contains(o: DoonObject): boolean {
        return this !== o && o instanceof DoonDatasetValue && this.name === o.name;
    }

    update(value: AttrValue): void {
        (<HTMLElement>this.element).dataset[this.name] = value == null ? '' : <string>value;
    }

}

export abstract class Component extends HTMLElement {

    abstract render() : NodeSource | Cell<NodeSource>;

    public events: EventStream<Event>;
    public shadowDocument? : DoonDocument;

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
        if(this.shadowDocument) return;
        const shadow = this.attachShadow({ mode : "closed" });
        this.observedEvents.forEach((e) => shadow.addEventListener(e, this.events));
        this.shadowDocument = new DoonDocument(shadow);
        this.shadowDocument.rootNode.update(this.render());
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
