type HTMLAttrName =
    "abbr" | "accept" | "accept-charset" | "accesskey" | "action" | "allow" | "allowfullscreen" | "allowpaymentrequest" | "alt" | "as" | "async" | "autocapitalize" | "autocomplete" | "autofocus" | "autoplay" | "charset" | "checked" | "cite" | "class" | "color" | "cols" | "colspan" | "content" | "contenteditable" | "controls" | "coords" | "crossorigin" | "data" | "datetime" | "decoding" | "default" | "defer" | "dir" | "dir" | "dirname" | "disabled" | "download" | "draggable" | "enctype" | "enterkeyhint" | "for" | "form" | "formaction" | "formenctype" | "formmethod" | "formnovalidate" | "formtarget" | "headers" | "height" | "hidden" | "high" | "href" | "hreflang" | "http-equiv" | "id" | "imagesizes" | "imagesrcset" | "inputmode" | "integrity" | "is" | "ismap" | "itemid" | "itemprop" | "itemref" | "itemscope" | "itemtype" | "kind" | "label" | "lang" | "list" | "loop" | "low" | "manifest" | "max" | "max" | "maxlength" | "media" | "method" | "min" | "minlength" | "multiple" | "muted" | "name" | "nomodule" | "nonce" | "novalidate" | "open" | "optimum" | "pattern" | "ping" | "placeholder" | "playsinline" | "poster" | "preload" | "readonly" | "referrerpolicy" | "rel" | "required" | "reversed" | "rows" | "rowspan" | "sandbox" | "scope" | "selected" | "shape" | "size" | "sizes" | "slot" | "span" | "spellcheck" | "src" | "srcdoc" | "srclang" | "srcset" | "start" | "step" | "style" | "tabindex" | "target" | "title" | "translate" | "type" | "usemap" | "value";

type CSSPropertyName =
    { [P in keyof CSSStyleDeclaration]: CSSStyleDeclaration[P] extends string ? P : never }[keyof CSSStyleDeclaration];

type DOMEventHandler =
    Omit<GlobalEventHandlers, "addEventListener" | "removeEventListener"> &
    Omit<DocumentAndElementEventHandlers, "addEventListener" | "removeEventListener">;

type ElementSource = {
    $?: AttributesSource | Cell<AttributesSource>;
} & {
    [P in keyof HTMLElementTagNameMap]?: NodeSource;
} | {
    [key: string]: NodeSource | AttributesSource | Cell<AttributesSource>;
};

type TextNodeSource =
    string | number | boolean | null | undefined;

type DocumentFragmentSource = NodeSource[];

type NodeSource =
    Node | TextNodeSource | DocumentFragmentSource | ElementSource | Cell<NodeSource>;

type AttrValue =
    undefined | null | string | boolean | number | string[] | Cell<AttrValue> | StyleSource | DatasetSource | DOMEventHandler[keyof DOMEventHandler];

type StyleSource = {
    [P in CSSPropertyName]: Cell<string | number | null> | string | number | null;
};

type DatasetSource = {
    [key: string]: Cell<string | number | null> | string | number | null;
};

type AttributesSource =
    { [P in HTMLAttrName]?: AttrValue; } & Partial<DOMEventHandler> & { [key : string]: AttrValue; };

type AttrSource =
    AttributesSource | StyleSource | DatasetSource;

type JSHTMLSource =
    NodeSource | AttrSource | AttrValue;

declare class Listener {
    append(that: Listener): Listener;
    unlisten(): void;
}

declare class Stream<A> {

    constructor(callback?: ((value: any) => A | Promise<A>) | Promise<A>);

    /**
     * 値の受け取りを監視するListenerを返す。
     * @param handler
     */
    listen(handler: (value: A) => void): Listener;

     /**
     * 一度きりの実行で登録を解除するListen
     * @param handler
     */
    listenOnce(handler: (value: A) => void): Listener;

    /**
     * 自身の後に連結されるStreamを返す。
     */
    map<B>(action: (arg: A) => B | Promise<B>): Stream<B>;

    /**
     * 定数値ストリームに変換する
     * @param b
     */
    mapTo<B>(b: B) : Stream<B>;

    /*
     * 値を受け取るセルを生成する。引数は初期値。
     */
    hold(init: A): Cell<A>;

    /**
     * 複数のStreamを一つのStreamにまとめる
     * @param that
     * @param lambda
     */
    merge(that: Stream<A> | Stream<A>[], lambda: (...values: A[]) => A): Stream<A>;

    /**
     * predicateからtrueを返された値だけ受け取るStreamを生成する。
     */
    filter(predicate: A): Stream<A>;
    filter(predicate: RegExp): Stream<A>;
    filter(predicate: (value: A) => boolean): Stream<A>;
    filter(predicate: any): Stream<A>;

    /**
     * 自身からcellの値を受け取るStreamを生成する。
     */
    snapshot<B,C>(c: Cell<B>, action: (a: A, b: B) => C): Stream<C>;
    snapshot<C>(c: Cell<any>[], action: (...values: any[]) => C): Stream<C>;
    snapshot<B,C>(cell: Cell<B> | Cell<any>[], action?: (...values: any[]) => C): Stream<C>;

}

declare class Cell<A> {

    static switchC<A>(cell: Cell<Cell<A>>): Cell<A>;
    static switchS<A>(cell: Cell<Stream<A>>): Stream<A>;

    constructor(init: A, stream?: Stream<A>);

    /**
     * listenerを登録する。Streamとは違い、初期値があるので即座に一度発火する。
     */
    listen(action: (v: A) => void): Listener;

    /**
     * 別のセルに自身の値をマッピングする。
     */
    map<B>(action: (value: A) => B): Cell<B>;

    /**
     * 自身と他のセルを元にする新しいCellを返す
     */
    lift<B,C>(that: Cell<B>, lambda: (a:A,b:B) => C) : Cell<C>;
    lift<B,C,D,E,F>(that: [Cell<B>,Cell<C>?,Cell<D>?,Cell<E>?], f?: (a:A,b:B,c:C,d:D,e:E) => F): Cell<F>;
    lift<B>(that: any, lambda: (...value: any[]) => B): Cell<B>;

    /**
     * 格納中の値を返す。sodium で言うところのsample()。
     */
    valueOf(): A;

    toString(): string;

}

declare class StreamLoop<A> extends Stream<A> {
    private origin: Stream<A> | null;
    loop(out: Stream<A>): void;
}

declare class CellLoop<A> extends Cell<A> {
    loop(out: Cell<A>) : void;
}

declare class StreamSink<A> extends Stream<A> {
    constructor(colease?: (...values: A[]) => A);
    send(value: A): void;
}

declare class CellSink<A> extends Cell<A> {
    constructor(init: A, colease?: (...value: A[]) => A);
    send(value: A): void;
}

/**
 * DOM EventをStreamに変換するクラス。
 * JSHTML内でイベントハンドラ(onclick, onkeydown等)の属性値として設置することで稼働する。
 */
declare class EventStream<E extends Event> extends StreamSink<E> implements EventListenerObject {
    handleEvent(evt: E): void;
}

declare abstract class DoonObject {
    public ownerDocument?: DoonDocument;
    abstract contains(o: DoonObject) : boolean;
    abstract update(value: JSHTMLSource, old_value: JSHTMLSource) : void;
}

declare class DoonDocument {
    public originalDoc: Document;
    public rootNode: DoonNode;
    constructor(root: ShadowRoot);
    createNode(source: NodeSource) : Node;
}

declare class DoonNode extends DoonObject {
    public parent?: DoonNode;
    public range: Range;
    contains(o: DoonObject): boolean;
    update(value: JSHTMLSource, old_value: JSHTMLSource): void;
}

declare class DoonAttributes extends DoonObject {
    public element: HTMLElement;
    contains(o: DoonObject): boolean;
    update(value: JSHTMLSource, old_value: JSHTMLSource): void;
}

declare class DoonAttr extends DoonObject {
    public element: HTMLElement;
    public name: string;
    contains(o: DoonObject): boolean;
    update(value: JSHTMLSource, old_value: JSHTMLSource): void;
}

declare class DoonStyleValue extends DoonAttr {
    contains(o: DoonObject): boolean;
    update(value: JSHTMLSource, old_value: JSHTMLSource): void;
}

declare class DoonDatasetValue extends DoonAttr {
    contains(o: DoonObject): boolean;
    update(value: JSHTMLSource, old_value: JSHTMLSource): void;
}

//type AttrChangedInfo = {name:string,newValue:string,oldValue:string};
declare class AttrChangedInfo extends String {
    public name : string;
    public oldValue : string;
    constructor(name:string,oldValue:string,newValue:string);
}

declare abstract class Component extends HTMLElement {
    
    abstract render() : NodeSource;

    public attrChanged : { [key:string]: Stream<AttrChangedInfo> };
    public shadowEvents: { [key:string]: Stream<Event> };
    public shadowDocument : DoonDocument;

    public attributeChangedCallback(name: string, oldValue: string, newValue: string) : void;
    public connectedCallback(): void;
    public disconnectedCallback() : void;
}

