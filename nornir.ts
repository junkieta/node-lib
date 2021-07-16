const _empty = () => {};

const PUSH : unique symbol = Symbol('PUSH');
const VALUE: unique symbol = Symbol('VALUE');
const INPUT: unique symbol = Symbol('INPUT');

type Output = Stream<unknown>|Cell<unknown>|Listener;

export const Operational = {

    _addTransaction(...fn: (()=>void)[]) {
        const tr = Transaction.currentTransaction;
        tr.splitted = tr.splitted ? tr.splitted.concat(fn) : fn;
    },

    updates<A>(c: Cell<A>): Stream<A> {
        return c[INPUT];
    },

    defer<A>(s: Stream<A>) : Stream<A> {
        const defered = new Stream<A>(Stream.PASS_THROUGH);
        s.listen((v) => this._addTransaction(() => StreamPipe.flow(defered, v)));
        return defered;
    },

    split<A>(s: Stream<A[]>) : Stream<A> {
        const splitted = s.map(([v,...values]) => {
            if (values.length)
                this._addTransaction(...values.map((v) => () => StreamPipe.flow(splitted, v)));
            return v;
        });
        return splitted;
    }

};

const StreamPipe = {

    streams: new WeakMap<Stream<unknown>, Output | Output[]>(),

    connect(a: Stream<unknown>, b: Output) {
        const current = this.streams.get(a);
        if (!current) {
            this.streams.set(a,b);
        } else if (Array.isArray(current)) {
            if (current.find((c) => c === b)) return;
            this.streams.set(a, current.concat(b));
        } else if (current !== b) {
            this.streams.set(a, [current, b]);
        }
    },

    disconnect(source: Stream<unknown>, destination: Output) {
        if (!this.streams.has(source)) return;
        const current = this.streams.get(source);
        if (!Array.isArray(current)) {
            if (current === destination)
                this.streams.delete(source);
            return;
        }
        const i = current.indexOf(destination);
        if (i === -1) return;
        current.splice(i, 1);
        if (current.length === 1)
            this.streams.set(source, current[0]);
        else if (!current.length)
            this.streams.delete(source);
    },

    flow(dest: Stream<unknown>, input: unknown) {
        let result: unknown;
        try {
            result = dest[PUSH](input);
        } catch (err) {
            if(err instanceof StreamingError) return;
            throw err;
        }

        let next = this.streams.get(dest);
        if(Array.isArray(next))
            next.forEach((out) => this.push(out, result));
        else if(next)
            this.push(next, result);

    },

    push(output: Output, value: unknown) {
        if (output instanceof Listener)
            output[PUSH](value);
        else if (output instanceof Cell)
            Transaction.currentTransaction.updated.set(output, value);
        else
            this.flow(output, value);
    }

    
}


export class Transaction {

    static currentTransaction = new Transaction();

    static run<A>(callback: () => A): A {
        const tr_previous = Transaction.currentTransaction;

        // Transactionスタート
        const tr = Transaction.currentTransaction = new Transaction();
        tr.running = true;

        // runnable実行
        const result = callback();

        // TransactionのStream処理はここで完結させる
        while (tr.flowing.length) {
            tr.flowing.splice(0).forEach((f) => f());
        }
        
        // Streamの処理終了時点でloopのチェック
        if (tr.waiting.size)
           throw new Error('StreamLoop と CellLoop はトランザクションの終了前に loop メソッドを呼び出す必要があります');

        // Cell更新処理
        if (tr.updated.size)
            tr.updated.forEach((v,c) => c[VALUE] = v);
        tr.updated.clear();

        // Transactionエンド
        tr.running = false;
        Transaction.currentTransaction = tr_previous;
        
        // 予約済みのTrarnsactionを実行
        if (tr.splitted)
            tr.splitted.splice(0).forEach((f) => Transaction.run(f));

        return result;
    }

    [PUSH](f: () => unknown) {
        this.flowing.push(f);
    }

    public running: boolean;
    public listening: boolean;
    public updated: Map<Cell<unknown>, unknown>;
    public waiting: Set<StreamLoop<unknown>|CellLoop<unknown>>;
    public splitted?: (()=>unknown)[];
    public flowing: (()=>unknown)[];

    constructor() {
        this.running = false;
        this.listening = false;
        this.updated = new Map();
        this.waiting = new Set();
        this.flowing = [];
    }
 
}


/**
 * listenから返されるオブジェクト。
 * */
class Listener {

    private _dispose: Function;
    private _apply : Function;

    constructor(f1?: Function, f2?: Function) {
        this._apply = f1 || _empty;
        this._dispose = f2 || _empty;
    }

    [PUSH](value: unknown) {
        const tr = Transaction.currentTransaction;
        if(tr.listening) throw new Error('listnerの処理中に別のListenerが呼び出されることはありえません');
        tr.listening = true;
        this._apply(value);
        tr.listening = false;
    }

    append(that: Listener): Listener {
        return new Listener(_empty, () => {
            this.unlisten();
            that.unlisten();
        });
    }

    unlisten() {
        this._dispose();
        this._apply = this._dispose = _empty;
    }

}

/**
 * Stream::filterで検知するエラー。
 * */
class StreamingError extends Error { }

export class Stream<A> {

    static fitlerOptional<A>(ev: Stream<A|undefined|null>) : Stream<A> {
        return ev.filter((v) => v !== null && v !== undefined) as Stream<A>;
    }

    static PASS_THROUGH<A>(value: A): A {
        return value;
    }

    [PUSH]: (value: any) => A;

    constructor(callback?: (value: any) => A) {
        this[PUSH] = typeof callback === 'function' ? callback : _never[PUSH];
    }

    /**
     * 値の受け取りを監視するListenerを返す。
     * @param handler
     */
    listen(handler: (value: A) => void): Listener {
        const l = new Listener(handler, () => StreamPipe.disconnect(this, l));
        StreamPipe.connect(this, l);
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
        StreamPipe.connect(this, s);
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
        StreamPipe.connect(this, c);
        return c;
    }

    /**
     * 複数のStreamを一つのStreamにまとめる
     * @param that
     * @param lambda
     */
    merge(that: Stream<A> | Stream<A>[], lambda: (a:A,b:A) => A = Stream.PASS_THROUGH): Stream<A> {
        const inputs = ([this] as Stream<A>[]).concat(that);
        const merged = new Stream<A>(Stream.PASS_THROUGH);

        let values : A[] = [];
        const replace_value = (v:A) => {
            if (values.length) {
                values = values.concat(v);
            } else {
                values = [v];
                Transaction.currentTransaction[PUSH](() => StreamPipe.flow(merged, values.splice(0).reduce(lambda)));
            }
        };

        inputs.forEach((s) => s.listen(replace_value));
        return merged;
    }

    orElse(that: Stream<A>) : Stream<A> {
        const values = new Map<Stream<A>,A>();
        const s = new Stream(Stream.PASS_THROUGH);
        const flow = (s: Stream<A>, v: A) => {
            if(!values.size) Transaction.currentTransaction[PUSH](() => {
                StreamPipe.flow(s, values.has(this) ? values.get(this) : values.get(that));
                values.clear();
            });
            values.set(s, v);
        };
        this.listen((v) => flow(this,v));
        that.listen((v) => flow(that,v));
        return s;
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
    snapshot<B,C>(cell: Cell<B>, action?: (a:A,b:B) => C): Stream<C>
    snapshot<B,C>(cell: Cell<B> | Cell<unknown>[], action?: (a:A, ...values: unknown[]) => C): Stream<C> {
        if (!Array.isArray(cell)) 
            return this.map(action
                ? (v) => action(v, cell.sample())
                : () => <C><unknown>cell.sample());

        const sample = () => cell.map((c) => c.sample());
        return this.map(action
            ? (v) => action(v, ...sample())
            : <()=>C><()=>unknown> sample);
    }

    accum<S>(state: S, f: (value:A,state:S) => S) : Cell<S> {
        return Transaction.run(() => {
            const ref = new CellLoop<S>();
            const stream = this.snapshot(ref, f);
            const cell = stream.hold(state);
            ref.loop(cell);
            return cell;
        });
    }

    collect<B,S>(state: S, f: (a:A,s:S) => [B,S]) {
        let current_state = state;
        return this.map((v) => {
            const [next, next_state] = f(v, current_state);
            current_state = next_state;
            return next;
        });
    }

    gate(c: Cell<boolean>) {
        return this.filter(() => c.sample());
    }

    toString() {
        return `[object Stream]`;
    }

}

const _never = new Stream<never>(() => { throw new StreamingError('never stream cannot [PUSH]') }); {
    const descriptor_return_never = { value: () => _never };
    Object.defineProperties(_never, {
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
            StreamPipe.disconnect(cell.sample()[INPUT], s);
            StreamPipe.connect(v[INPUT], s);
            Transaction.run(() => StreamPipe.flow(s, v.sample()));
        });
        return s.hold(cell.sample().sample());
    }

    static switchS<A>(cell: Cell<Stream<A>>): Stream<A> {
        const s = new Stream<A>(Stream.PASS_THROUGH);
        cell.listen((v) => {
            StreamPipe.disconnect(cell.sample(), s);
            StreamPipe.connect(v, s);
        });
        return s;
    }

    [VALUE]: A;
    [INPUT]: Stream<A>;

    constructor(init: A, stream?: Stream<A>) {
        this[VALUE] = init;
        this[INPUT] = stream instanceof Stream ? stream : _never;
    }

    /**
     * listenerを登録する。Streamとは違い、初期値があるので即座に一度発火する。
     */
    listen(action: (v: A) => void): Listener {
        const l = this[INPUT].listen(action);
        action(this.sample());
        return l;
    }

    /**
     * 別のセルに自身の値をマッピングする。
     */
    map<B>(action: (value: A) => B): Cell<B> {
        return this[INPUT].map(action).hold(action(this.sample()));
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
        cells.map(Operational.updates).forEach((s,i) => s.listen((v) => {
            values[i] = v;
            if (!update_flag) {
                update_flag = true;
                Transaction.currentTransaction[PUSH](() => {
                    StreamPipe.flow(stream, lambda(...<[A]>values));
                    update_flag = false;
                });
            }
        }));
        update_flag = false;

        return stream.hold(lambda(...<[A]>values));

    }

    /**
     * 格納中の値を返す。sodium で言うところのsample()。
     */
    sample(): A {
        return this[VALUE];
    }

    toString(): string {
        return `[object Cell<${this[VALUE]}>]`;
    }

}

export class StreamLoop<A> extends Stream<A> {

    constructor() {
        if(!Transaction.currentTransaction.running) throw new Error('StreamLoop / CellLoopはトランザクション中にしか作成できません');
        super(Stream.PASS_THROUGH);
        Transaction.currentTransaction.waiting.add(this);
    }

    loop(out: Stream<A>) {
        if(!Transaction.currentTransaction.waiting.has(this)) throw new Error('loopメソッドは既に呼び出し済みです');
        Transaction.currentTransaction.waiting.delete(this);
        StreamPipe.connect(out, this);
    }

}

export class CellLoop<A> extends Cell<A> {

    static BEFORE_INIT = Symbol('before_init');

    constructor() {
        if(!Transaction.currentTransaction.running) throw new Error('StreamLoop / CellLoopはトランザクション中にしか作成できません');
        super(<A><unknown>CellLoop.BEFORE_INIT, new Stream<A>(Stream.PASS_THROUGH));
        Transaction.currentTransaction.waiting.add(this);
    }

    loop(out: Cell<A>) {
        if(!Transaction.currentTransaction.waiting.has(this)) throw new Error('loopメソッドは既に呼び出し済みです');
        Transaction.currentTransaction.waiting.delete(this);

        const proxy = this[INPUT];
        const origin = out[INPUT];
        const added = StreamPipe.streams.get(proxy);

        this[INPUT] = origin;
        this[VALUE] = out.sample();
        StreamPipe.connect(origin, this);
        if (!added) return;

        StreamPipe.streams.delete(proxy);
        if(Array.isArray(added))
            added.forEach((o) => StreamPipe.connect(origin, o));
        else
            StreamPipe.connect(origin, added);
    }

}

export class StreamSink<A> extends Stream<A> {

    private _message?: A;

    private _colease: (a:A,b:A) => A =
        () => { throw new Error('同一トランザクションで複数回sendする場合はSink生成時にcoleaseを指定してください') };

    constructor(colease?: (a:A,b:A) => A) {
        super(Stream.PASS_THROUGH);
        if(colease) this._colease = colease;
    }

    send(value: A) {
        if (Transaction.currentTransaction.listening)
            throw new Error('Listenerが呼び出されている間、sendは使用できません');

        // トランザクションを開始する
        if (!Transaction.currentTransaction.running) {
            Transaction.run(() => this.send(value));
        }
        // 実行中のトランザクションにpush済みなら、値をcoleaseする
        else if(this.hasOwnProperty('_message')) {
            this._message = this._colease(value, <A> this._message);
        }
        // 実行中のトランザクションにpushする
        else {
            this._message = value;
            Transaction.currentTransaction[PUSH](() => {
                const v = this._message;
                delete this._message;
                StreamPipe.flow(this, v);
            });
        }
    }

}

export class CellSink<A> extends Cell<A> {

    constructor(init: A, colease?: (a:A,b:A) => A) {
        const sink = new StreamSink<A>(colease);
        super(init, sink);
        StreamPipe.connect(sink, this);
    }

    send(value: A) {
        (<StreamSink<A>>this[INPUT]).send(value);
    }

}


class DurationMoment {

    elapsedTime: number
    startedTime: number

    constructor(t: number = 0) {
        this.startedTime = t;
        this.elapsedTime = t ? performance.now() - t : 0;
    }

}

class TimerSystem {

    private _timeSS : StreamSink<Stream<unknown>>;

    public time: Cell<number>;

    constructor() {
        this._timeSS = new StreamSink();

        const streams = this._timeSS.accum(new Set<Stream<unknown>>(), (s,set) => {
            set.add(s);
            s.listenOnce(() => set.delete(s));
            return set;
        });

        const sink = new StreamSink<number>();
        const fn = () => {
            sink.send(performance.now());
            if(streams.sample().size) {
                requestAnimationFrame(fn);
            }
        };
        Operational.updates(streams)
            .filter((set) => set.size === 1)
            .listen(() => requestAnimationFrame(() => Transaction.run(fn)));

        this.time = sink.hold(performance.now());
    }

    duration(ms: number) {
        const t = Operational.updates(this.time);
        const m = t.accum(new DurationMoment(), (t, moment) => new DurationMoment(moment.startedTime || t));
        const result = m.map((m) => m.elapsedTime ? Math.min(m.elapsedTime/ms, 1) : 0);
        const complete = Operational.updates(result).filter((n) => n === 1)
        complete.listenOnce(() => StreamPipe.disconnect(t,m[INPUT]));
        this._timeSS.send(complete);
        return result;
    }


}

export const Timer = new TimerSystem();



// 以下はVirtualDOM実装
export interface WebComponentConstructor extends CustomElementConstructor {
    tag: string;
    shadowOpen: boolean;
    prefix?: string;
    observedAttributes?: string[];
    observedMutation?: MutationObserverInit;
}

export interface WebComponentClass {
    attributeChangedCallback?(name: string, oldValue: string, newValue: string) : void;
    connectedCallback?() : void;
    disconnectedCallback?(): void;
    adoptedCallback?(olddoc: Document, newdoc: Document): void;
}

export type HTMLAttrName =
    "abbr" | "accept" | "accept-charset" | "accesskey" | "action" | "allow" | "allowfullscreen" | "allowpaymentrequest" | "alt" | "as" | "async" | "autocapitalize" | "autocomplete" | "autofocus" | "autoplay" | "charset" | "checked" | "cite" | "class" | "color" | "cols" | "colspan" | "content" | "contenteditable" | "controls" | "coords" | "crossorigin" | "data" | "datetime" | "decoding" | "default" | "defer" | "dir" | "dir" | "dirname" | "disabled" | "download" | "draggable" | "enctype" | "enterkeyhint" | "for" | "form" | "formaction" | "formenctype" | "formmethod" | "formnovalidate" | "formtarget" | "headers" | "height" | "hidden" | "high" | "href" | "hreflang" | "http-equiv" | "id" | "imagesizes" | "imagesrcset" | "inputmode" | "integrity" | "is" | "ismap" | "itemid" | "itemprop" | "itemref" | "itemscope" | "itemtype" | "kind" | "label" | "lang" | "list" | "loop" | "low" | "manifest" | "max" | "maxlength" | "media" | "method" | "min" | "minlength" | "multiple" | "muted" | "name" | "nomodule" | "nonce" | "novalidate" | "open" | "optimum" | "pattern" | "ping" | "placeholder" | "playsinline" | "poster" | "preload" | "readonly" | "referrerpolicy" | "rel" | "required" | "reversed" | "rows" | "rowspan" | "sandbox" | "scope" | "selected" | "shape" | "size" | "sizes" | "slot" | "span" | "spellcheck" | "src" | "srcdoc" | "srclang" | "srcset" | "start" | "step" | "style" | "tabindex" | "target" | "title" | "translate" | "type" | "usemap" | "value";

export type CSSPropertyName =
    { [P in keyof CSSStyleDeclaration]: CSSStyleDeclaration[P] extends string ? P : never }[keyof CSSStyleDeclaration];

export type DOMEventHandlerExpr<E extends Event> =
     { handleEvent(e:E): any } | ((e:E) => any) | string | null;

export type DOMEventHandler = Partial<{
    onabort: DOMEventHandlerExpr<UIEvent>;
    onanimationcancel: DOMEventHandlerExpr<AnimationEvent>;
    onanimationend: DOMEventHandlerExpr<AnimationEvent>;
    onanimationiteration: DOMEventHandlerExpr<AnimationEvent>;
    onanimationstart: DOMEventHandlerExpr<AnimationEvent>;
    onauxclick: DOMEventHandlerExpr<MouseEvent>;
    onblur: DOMEventHandlerExpr<FocusEvent>;
    oncancel: DOMEventHandlerExpr<Event>;
    oncanplay: DOMEventHandlerExpr<Event>;
    oncanplaythrough: DOMEventHandlerExpr<Event>;
    onchange: DOMEventHandlerExpr<Event>;
    onclick: DOMEventHandlerExpr<MouseEvent>;
    onclose: DOMEventHandlerExpr<Event>;
    oncontextmenu: DOMEventHandlerExpr<MouseEvent>;
    oncuechange: DOMEventHandlerExpr<Event>;
    ondblclick: DOMEventHandlerExpr<MouseEvent>;
    ondrag: DOMEventHandlerExpr<DragEvent>;
    ondragend: DOMEventHandlerExpr<DragEvent>;
    ondragenter: DOMEventHandlerExpr<DragEvent>;
    ondragexit: DOMEventHandlerExpr<Event>;
    ondragleave: DOMEventHandlerExpr<DragEvent>;
    ondragover: DOMEventHandlerExpr<DragEvent>;
    ondragstart: DOMEventHandlerExpr<DragEvent>;
    ondrop: DOMEventHandlerExpr<DragEvent>;
    ondurationchange: DOMEventHandlerExpr<Event>;
    onemptied: DOMEventHandlerExpr<Event>;
    onended: DOMEventHandlerExpr<Event>;
    onerror: DOMEventHandlerExpr<ErrorEvent>;
    onfocus: DOMEventHandlerExpr<FocusEvent>;
    onfocusin: DOMEventHandlerExpr<FocusEvent>;
    onfocusout: DOMEventHandlerExpr<FocusEvent>;
//    onformdata: DOMEventHandlerExpr<FormDataEvent>;
    onformdata: DOMEventHandlerExpr<Event & { formdata: FormData }>;
    ongotpointercapture: DOMEventHandlerExpr<PointerEvent>;
    oninput: DOMEventHandlerExpr<Event>;
    oninvalid: DOMEventHandlerExpr<Event>;
    onkeydown: DOMEventHandlerExpr<KeyboardEvent>;
    onkeypress: DOMEventHandlerExpr<KeyboardEvent>;
    onkeyup: DOMEventHandlerExpr<KeyboardEvent>;
    onload: DOMEventHandlerExpr<Event>;
    onloadeddata: DOMEventHandlerExpr<Event>;
    onloadedmetadata: DOMEventHandlerExpr<Event>;
    onloadstart: DOMEventHandlerExpr<Event>;
    onlostpointercapture: DOMEventHandlerExpr<PointerEvent>;
    onmousedown: DOMEventHandlerExpr<MouseEvent>;
    onmouseenter: DOMEventHandlerExpr<MouseEvent>;
    onmouseleave: DOMEventHandlerExpr<MouseEvent>;
    onmousemove: DOMEventHandlerExpr<MouseEvent>;
    onmouseout: DOMEventHandlerExpr<MouseEvent>;
    onmouseover: DOMEventHandlerExpr<MouseEvent>;
    onmouseup: DOMEventHandlerExpr<MouseEvent>;
    onpause: DOMEventHandlerExpr<Event>;
    onplay: DOMEventHandlerExpr<Event>;
    onplaying: DOMEventHandlerExpr<Event>;
    onpointercancel: DOMEventHandlerExpr<PointerEvent>;
    onpointerdown: DOMEventHandlerExpr<PointerEvent>;
    onpointerenter: DOMEventHandlerExpr<PointerEvent>;
    onpointerleave: DOMEventHandlerExpr<PointerEvent>;
    onpointermove: DOMEventHandlerExpr<PointerEvent>;
    onpointerout: DOMEventHandlerExpr<PointerEvent>;
    onpointerover: DOMEventHandlerExpr<PointerEvent>;
    onpointerup: DOMEventHandlerExpr<PointerEvent>;
    onprogress: DOMEventHandlerExpr<ProgressEvent>;
    onratechange: DOMEventHandlerExpr<Event>;
    onreset: DOMEventHandlerExpr<Event>;
    onresize: DOMEventHandlerExpr<UIEvent>;
    onscroll: DOMEventHandlerExpr<Event>;
    onsecuritypolicyviolation: DOMEventHandlerExpr<SecurityPolicyViolationEvent>;
    onseeked: DOMEventHandlerExpr<Event>;
    onseeking: DOMEventHandlerExpr<Event>;
    onselect: DOMEventHandlerExpr<Event>;
    onselectionchange: DOMEventHandlerExpr<Event>;
    onselectstart: DOMEventHandlerExpr<Event>;
    // lib.dom.d.tsに存在しないため追加
    onslotchange: DOMEventHandlerExpr<Event>;
    onstalled: DOMEventHandlerExpr<Event>;
    onsubmit: DOMEventHandlerExpr<Event>;
    onsuspend: DOMEventHandlerExpr<Event>;
    ontimeupdate: DOMEventHandlerExpr<Event>;
    ontoggle: DOMEventHandlerExpr<Event>;
    ontouchcancel: DOMEventHandlerExpr<TouchEvent>;
    ontouchend: DOMEventHandlerExpr<TouchEvent>;
    ontouchmove: DOMEventHandlerExpr<TouchEvent>;
    ontouchstart: DOMEventHandlerExpr<TouchEvent>;
    ontransitioncancel: DOMEventHandlerExpr<TransitionEvent>;
    ontransitionend: DOMEventHandlerExpr<TransitionEvent>;
    ontransitionrun: DOMEventHandlerExpr<TransitionEvent>;
    ontransitionstart: DOMEventHandlerExpr<TransitionEvent>;
    onvolumechange: DOMEventHandlerExpr<Event>;
    onwaiting: DOMEventHandlerExpr<Event>;
    onwheel: DOMEventHandlerExpr<WheelEvent>;
}>;

export type ElementSource = {
    $?: AttributesSource | Cell<AttributesSource>;
} & {
    [P in keyof HTMLElementTagNameMap]?: NodeSource;
} | {
    [key: string]: NodeSource | AttributesSource | Cell<AttributesSource>;
};

export type DOMStringSource = string | number | boolean | null | undefined | { toString() : string };

export type TextNodeSource = DOMStringSource;

export type DocumentFragmentSource =
    NodeSource[];

export type NodeSource =
    Node | TextNodeSource | DocumentFragmentSource | ElementSource | Cell<NodeSource> | Promise<NodeSource>;

export type AttrValue =
    DOMStringSource | string[] | DOMEventHandler[keyof DOMEventHandler] | StyleSource | DatasetSource | Promise<AttrValue> | Cell<AttrValue>;

export type StyleSource = {
    [P in CSSPropertyName]: Cell<DOMStringSource> | DOMStringSource;
};

export type DatasetSource = {
    [key: string]: Cell<DOMStringSource> | DOMStringSource;
};

export type AttributesSource =
   { [P in HTMLAttrName]?: AttrValue; } & DOMEventHandler & { [key:string]: AttrValue | DOMEventHandler[keyof DOMEventHandler] };

export type AttrSource =
    AttributesSource | StyleSource | DatasetSource;

export type JSHTMLSource =
    NodeSource | AttrSource | AttrValue;

export type ShadowEventMap = {
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

    private map : Map<VDOMObject, Listener>;
    private queue : VDOMUpdateHistory[];

    constructor() {
        super();
        this.map = new Map();
        this.queue = [];
    }

    registerCell(ctx: VDOMObject, cell: Cell<JSHTMLSource>) {
        this.map.get(ctx)?.unlisten();
        this.map.set(ctx, 
            cell.listen((v) => this.enqueue({
                target: ctx,
                newValue: v,
                oldValue: cell.sample()
            }))
        );
    }

    unregisterCell(ctx: VDOMObject) {
        this.map.get(ctx)?.unlisten();
        this.map.delete(ctx);
    }

    garbageCollect(root: VDOMObject): void {
        Array.from(this.map.keys())
            .filter((c) => root.contains(c))
            .forEach((c) => this.unregisterCell(c));
    }

    enqueue(h: VDOMUpdateHistory) {
        if(this.queue.push(h) === 1)
            Transaction.currentTransaction[PUSH](() =>
                this.queue
                    .splice(0)
                    .filter(({target},i,q) => q.every((h) => target === h.target || !h.target.contains(target)))
                    .forEach((h) => this.applyUpdateToVDOM(h)));
    }

    applyUpdateToVDOM({target,newValue,oldValue}: VDOMUpdateHistory) {
        this.garbageCollect(target);
        target.update(newValue,oldValue);
    }

    static calm(updates: VDOMUpdateHistory[]) {
        return updates.filter(({target}) => updates.every((h) => target === h.target || !h.target.contains(target)))
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

export function jshtml(source: NodeSource) {
    return new JSHTML(source).result
}

export class JSHTML {

    public result: Comment | Text | HTMLElementTagNameMap[keyof HTMLElementTagNameMap] | HTMLElement | DocumentFragment;
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
            n = new Comment('[PROMISE]');
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
                n = new Comment('[EMPTY]');
            else {
                const df = document.createDocumentFragment();
                source.forEach((s) => {
                    const r = new JSHTML(s);
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
    const s = new Stream<Event>();
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
    public mutationStream? : MutationStream;

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
                const flow = () => StreamPipe.flow(this[e.type], e);
                if(!Transaction.currentTransaction.running)
                    Transaction.run(flow);
                else
                    Transaction.currentTransaction[PUSH](flow);
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
        this.mutationStream = m;
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        const changed = this.attrChanged;
        if(!changed.hasOwnProperty(name))
            changed[name] = new StreamSink();
        (<StreamSink<string|null>>changed[name]).send(newValue);
    }

    connectedCallback() {
        this.shadowContext.update(this.render());
        if(this.mutationStream)
            this.mutationStream.observer.observe(this,  (<WebComponentConstructor>this.constructor).observedMutation);
    }

    disconnectedCallback() {
        this.shadowContext.update(null);
        if(this.mutationStream)
            this.mutationStream.observer.disconnect();
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
    Operational,
    Stream,
    StreamLoop,
    StreamSink,
    Cell,
    CellSink,
    CellLoop,
    Transaction,
    Component
};
