

/**
 * Cell
 * */
interface CellInterface<T> {

    /**
     * 格納中の値を返す。sodium で言うところのsample()。
     */
    valueOf() : T;

   /**
     * listenerを登録する。Streamとは違い、初期値があるので即座に一度発火する。
     */
    listen(fn:Function) : { unlisten() : void; };

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

}


/**
 * listenから返されるオブジェクト。
 * */
interface ListenerInterface {
    append(that: ListenerInterface): ListenerInterface;
    unlisten() : void;
}

interface StreamInterface<A> {

    /**
     * 値の受け取りを監視するListenerを返す。
     * @param handler
     */
    listen(handler: (value: A) => void): ListenerInterface;

     /**
     * 一度きりの実行で登録を解除するListen
     * @param handler
     */
    listenOnce(handler: (value: A) => void): ListenerInterface;

    /**
     * 自身の後に連結されるStreamを返す。
     */
    map<B>(action: (arg: A) => B | Promise<B>): StreamInterface<B>;

    /**
     * 定数値ストリームに変換する
     * @param b
     */
    mapTo<B>(b: B) : StreamInterface<B>;

    /*
     * 値を受け取るセルを生成する。引数は初期値。
     */
    hold(init: A): CellInterface<A>;

    /**
     * 複数のStreamを一つのStreamにまとめる
     * @param that
     * @param lambda
     */
    merge(that: StreamInterface<A> | StreamInterface<A>[], lambda: (...values: A[]) => A): StreamInterface<A>;

    /**
     * predicateからtrueを返された値だけ受け取るStreamを生成する。
     */
    filter(predicate: A): StreamInterface<A>;
    filter(predicate: RegExp): StreamInterface<A>;
    filter(predicate: (value: A) => boolean): StreamInterface<A>;
    filter(predicate: any): StreamInterface<A>;

    /**
     * 自身からcellの値を受け取るStreamを生成する。
     */
    snapshot<B,C>(c: CellInterface<B>, action: (a: A, b: B) => C): StreamInterface<C>;
    snapshot<C>(c: CellInterface<any>[], action: (...values: any[]) => C): StreamInterface<C>;
    snapshot<B,C>(cell: CellInterface<B> | CellInterface<any>[], action?: (...values: any[]) => C): StreamInterface<C>;

}


interface WebComponentConstructor extends CustomElementConstructor {
    tag: string;
    observedAttributes?: string[];
    observedEvents?: string[];
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
    $?: AttributesSource | CellInterface<AttributesSource>;
} & {
    [P in keyof HTMLElementTagNameMap]?: NodeSource;
} | {
    [key: string]: NodeSource | AttributesSource | CellInterface<AttributesSource>;
};

type DOMStringSource = string | number | boolean | null | undefined | { toString() : string };

type TextNodeSource = DOMStringSource;

type CSSSelectorSource =
    string | string[];

type CSSRuleSource =
    string | [CSSPropertyName, TextNodeSource] | CellInterface<CSSRuleSource>;

type CSSTextSource =
    string | null | undefined | [CSSSelectorSource, CSSRuleSource][] | Map<CSSSelectorSource, CSSRuleSource> | CellInterface<CSSTextSource>;

type DocumentFragmentSource =
    NodeSource[];

type NodeSource =
    Node | TextNodeSource | DocumentFragmentSource | ElementSource | CellInterface<NodeSource> | Promise<NodeSource>;

type AttrValue =
    DOMStringSource | string[] | DOMEventHandler[keyof DOMEventHandler] | StyleSource | DatasetSource | Promise<AttrValue> | CellInterface<AttrValue>;

type StyleSource = {
    [P in CSSPropertyName]: CellInterface<DOMStringSource> | DOMStringSource;
};

type DatasetSource = {
    [key: string]: CellInterface<DOMStringSource> | DOMStringSource;
};

type AttributesSource =
   { [P in HTMLAttrName]?: AttrValue; } & DOMEventHandler & { [key:string]: AttrValue | DOMEventHandler[keyof DOMEventHandler] };

type AttrSource =
    AttributesSource | StyleSource | DatasetSource;

type JSHTMLSource =
    NodeSource | AttrSource | AttrValue;

type ShadowEventMap = {
    "abort": StreamInterface<UIEvent>;
    "animationcancel": StreamInterface<AnimationEvent>;
    "animationend": StreamInterface<AnimationEvent>;
    "animationiteration": StreamInterface<AnimationEvent>;
    "animationstart": StreamInterface<AnimationEvent>;
    "auxclick": StreamInterface<MouseEvent>;
    "blur": StreamInterface<FocusEvent>;
    "cancel": StreamInterface<Event>;
    "canplay": StreamInterface<Event>;
    "canplaythrough": StreamInterface<Event>;
    "change": StreamInterface<Event>;
    "click": StreamInterface<MouseEvent>;
    "close": StreamInterface<Event>;
    "contextmenu": StreamInterface<MouseEvent>;
    "cuechange": StreamInterface<Event>;
    "dblclick": StreamInterface<MouseEvent>;
    "drag": StreamInterface<DragEvent>;
    "dragend": StreamInterface<DragEvent>;
    "dragenter": StreamInterface<DragEvent>;
    "dragexit": StreamInterface<Event>;
    "dragleave": StreamInterface<DragEvent>;
    "dragover": StreamInterface<DragEvent>;
    "dragstart": StreamInterface<DragEvent>;
    "drop": StreamInterface<DragEvent>;
    "durationchange": StreamInterface<Event>;
    "emptied": StreamInterface<Event>;
    "ended": StreamInterface<Event>;
    "error": StreamInterface<ErrorEvent>;
    "focus": StreamInterface<FocusEvent>;
    "focusin": StreamInterface<FocusEvent>;
    "focusout": StreamInterface<FocusEvent>;
    "gotpointercapture": StreamInterface<PointerEvent>;
    "input": StreamInterface<Event>;
    "invalid": StreamInterface<Event>;
    "keydown": StreamInterface<KeyboardEvent>;
    "keypress": StreamInterface<KeyboardEvent>;
    "keyup": StreamInterface<KeyboardEvent>;
    "load": StreamInterface<Event>;
    "loadeddata": StreamInterface<Event>;
    "loadedmetadata": StreamInterface<Event>;
    "loadstart": StreamInterface<Event>;
    "lostpointercapture": StreamInterface<PointerEvent>;
    "mousedown": StreamInterface<MouseEvent>;
    "mouseenter": StreamInterface<MouseEvent>;
    "mouseleave": StreamInterface<MouseEvent>;
    "mousemove": StreamInterface<MouseEvent>;
    "mouseout": StreamInterface<MouseEvent>;
    "mouseover": StreamInterface<MouseEvent>;
    "mouseup": StreamInterface<MouseEvent>;
    "pause": StreamInterface<Event>;
    "play": StreamInterface<Event>;
    "playing": StreamInterface<Event>;
    "pointercancel": StreamInterface<PointerEvent>;
    "pointerdown": StreamInterface<PointerEvent>;
    "pointerenter": StreamInterface<PointerEvent>;
    "pointerleave": StreamInterface<PointerEvent>;
    "pointermove": StreamInterface<PointerEvent>;
    "pointerout": StreamInterface<PointerEvent>;
    "pointerover": StreamInterface<PointerEvent>;
    "pointerup": StreamInterface<PointerEvent>;
    "progress": StreamInterface<ProgressEvent>;
    "ratechange": StreamInterface<Event>;
    "reset": StreamInterface<Event>;
    "resize": StreamInterface<UIEvent>;
    "scroll": StreamInterface<Event>;
    "securitypolicyviolation": StreamInterface<SecurityPolicyViolationEvent>;
    "seeked": StreamInterface<Event>;
    "seeking": StreamInterface<Event>;
    "select": StreamInterface<Event>;
    "selectionchange": StreamInterface<Event>;
    "selectstart": StreamInterface<Event>;
    "stalled": StreamInterface<Event>;
    "submit": StreamInterface<Event>;
    "suspend": StreamInterface<Event>;
    "timeupdate": StreamInterface<Event>;
    "toggle": StreamInterface<Event>;
    "touchcancel": StreamInterface<TouchEvent>;
    "touchend": StreamInterface<TouchEvent>;
    "touchmove": StreamInterface<TouchEvent>;
    "touchstart": StreamInterface<TouchEvent>;
    "transitioncancel": StreamInterface<TransitionEvent>;
    "transitionend": StreamInterface<TransitionEvent>;
    "transitionrun": StreamInterface<TransitionEvent>;
    "transitionstart": StreamInterface<TransitionEvent>;
    "volumechange": StreamInterface<Event>;
    "waiting": StreamInterface<Event>;
    "wheel": StreamInterface<WheelEvent>;
} & { [key:string]: StreamInterface<Event> };
