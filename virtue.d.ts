
interface Listener {
   append(that: Listener): Listener;
   unlisten(): void;
}


interface Stream<A> {

    constructor(callback?: ((value: any) => A | Promise<A>) | Promise<A>): void;
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
    filter(predicate: A|RegExp|((value: A) => boolean)|any): Stream<A>;

    /**
     * 自身からcellの値を受け取るStreamを生成する。
     */
    snapshot<B,C>(c: Cell<B>, action: (a: A, b: B) => C): Stream<C>;
    snapshot<C>(c: Cell<any>[], action: (...values: any[]) => C): Stream<C>;
    snapshot<B,C>(cell: Cell<B> | Cell<any>[], action?: (...values: any[]) => C): Stream<C>;

}

interface Cell<A> {

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
    lift<R,B>(that: Cell<B>|[Cell<B>], lambda: (a:A,b:B) => R) : Cell<R>;
    lift<R,B,C>(that: Cell<B>|[Cell<B>,Cell<C>], lambda: (a:A,b:B,c:C) => R): Cell<R>;
    lift<R,B,C,D>(that: Cell<B>|[Cell<B>,Cell<C>,Cell<D>], lambda: (a:A,b:B,c:C,d:D) => R): Cell<R>;
    lift<R,B,C,D,E>(that: Cell<B>|[Cell<B>,Cell<C>,Cell<D>,Cell<E>], lambda: (a:A,b:B,c:C,d:D,e:E) => R): Cell<R>;
    lift<R>(that: Cell<any> | Cell<any>[], lambda: (a:A,...b:any[]) => R): Cell<R>;

    /**
     * 格納中の値を返す。sodium で言うところのsample()。
     */
    valueOf(): A;
    toString(): string;

}

interface WebComponentConstructor extends CustomElementConstructor {
    tag: string;
    shadowOpen: boolean;
    prefix?: string;
    observedAttributes?: string[];
    observedMutation?: MutationObserverInit;
}

interface WebComponentClass {
    attributeChangedCallback?(name: string, oldValue: string, newValue: string) : void;
    connectedCallback?() : void;
    disconnectedCallback?(): void;
    adoptedCallback?(olddoc: Document, newdoc: Document): void;
}

type HTMLAttrName =
    "abbr" | "accept" | "accept-charset" | "accesskey" | "action" | "allow" | "allowfullscreen" | "allowpaymentrequest" | "alt" | "as" | "async" | "autocapitalize" | "autocomplete" | "autofocus" | "autoplay" | "charset" | "checked" | "cite" | "class" | "color" | "cols" | "colspan" | "content" | "contenteditable" | "controls" | "coords" | "crossorigin" | "data" | "datetime" | "decoding" | "default" | "defer" | "dir" | "dir" | "dirname" | "disabled" | "download" | "draggable" | "enctype" | "enterkeyhint" | "for" | "form" | "formaction" | "formenctype" | "formmethod" | "formnovalidate" | "formtarget" | "headers" | "height" | "hidden" | "high" | "href" | "hreflang" | "http-equiv" | "id" | "imagesizes" | "imagesrcset" | "inputmode" | "integrity" | "is" | "ismap" | "itemid" | "itemprop" | "itemref" | "itemscope" | "itemtype" | "kind" | "label" | "lang" | "list" | "loop" | "low" | "manifest" | "max" | "maxlength" | "media" | "method" | "min" | "minlength" | "multiple" | "muted" | "name" | "nomodule" | "nonce" | "novalidate" | "open" | "optimum" | "pattern" | "ping" | "placeholder" | "playsinline" | "poster" | "preload" | "readonly" | "referrerpolicy" | "rel" | "required" | "reversed" | "rows" | "rowspan" | "sandbox" | "scope" | "selected" | "shape" | "size" | "sizes" | "slot" | "span" | "spellcheck" | "src" | "srcdoc" | "srclang" | "srcset" | "start" | "step" | "style" | "tabindex" | "target" | "title" | "translate" | "type" | "usemap" | "value";

type CSSPropertyName =
    { [P in keyof CSSStyleDeclaration]: CSSStyleDeclaration[P] extends string ? P : never }[keyof CSSStyleDeclaration];

type DOMEventHandlerExpr<E extends Event> =
     { handleEvent(e:E): any } | ((e:E) => any) | string | null;

type DOMEventHandler = Partial<{
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

type ElementSource = {
    $?: AttributesSource | Cell<AttributesSource>;
} & {
    [P in keyof HTMLElementTagNameMap]?: NodeSource;
} | {
    [key: string]: NodeSource | AttributesSource | Cell<AttributesSource>;
};

type DOMStringSource = string | number | boolean | null | undefined | { toString() : string };

type TextNodeSource = DOMStringSource;

type CSSSelectorSource =
    string | string[];

type CSSRuleSource =
    string | [CSSPropertyName, TextNodeSource] | Cell<CSSRuleSource>;

type CSSTextSource =
    string | null | undefined | [CSSSelectorSource, CSSRuleSource][] | Map<CSSSelectorSource, CSSRuleSource> | Cell<CSSTextSource>;

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


declare class VDOMConnection extends Map<VDOMObject, Listener> {
    registerCell(ctx: VDOMObject, cell: Cell<JSHTMLSource>) : void;
    unregisterCell(ctx: VDOMObject) : void;
    garbageCollect(root: VDOMObject): void;
    reserveCellUpdate(upd: VDOMUpdateHistory): void;
    applyVDOMUpdate(upd: VDOMUpdateHistory[]):void;
}

declare abstract class VDOMObject {
    abstract point : PointReference;
    abstract contains(o: VDOMObject) : boolean;
    abstract update(value: JSHTMLSource, old_value: JSHTMLSource) : void;
    protected registerCell(cell: Cell<JSHTMLSource>): void;
}

type VDOMUpdateHistory = {
    target: VDOMObject;
    newValue: JSHTMLSource;
    oldValue?: JSHTMLSource;
};

type VDOMPlaceholder = [Comment,Cell<NodeSource>];

type BuildVDOMResult = {
    result: Comment | Text | HTMLElement | DocumentFragment;
    placeholders: VDOMPlaceholder[];
};

type PointReference = Node | [Node,Node];
