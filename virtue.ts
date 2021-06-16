///<reference path="./virtue.d.ts" />
import { Listener, Cell, Transaction, StreamSink, Stream } from "./virtue-sodium";

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


/**
    * 引数に渡された全てのオブジェクトのキーをマージ
    * @param o
    */
function mergePropertyNames(...o : any[]) : string[] {
    return o
        .reduce((a:string[],o) => { if(o) for(let k in o) a.push(k); return a; },[])
        .filter((k,i,a) => a.indexOf(k,i+1) === -1);
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

export function jshtml(source: NodeSource) : BuildVDOMResult {
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
        const elm = document.createElement(tag);
        const attributes = (<ElementSource>source).$;
        const children_source = (<ElementSource>source)[<keyof HTMLElementTagNameMap>tag];
        // apply attributes
        if (Object(attributes) === attributes)
            new AttributesContext(elm).update(<AttributesSource>attributes);
        // add children
        if (children_source == null) return { result: elm, placeholders: [] };

        const child_result = jshtml(children_source);
        elm.appendChild(child_result.result);
        n = elm;
        if(child_result.placeholders.length)
            p.push(...child_result.placeholders);
    }

    if(!n) {
        console.log('invalid argument : cannot parse source object', source);
        throw new Error('invalid argument : cannot parse source object');
    }

    return {
        result: n,
        placeholders: p
    };

}


type PointReference = Node | [Node,Node];

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
        const {result,placeholders} = jshtml(source);

        const next_point = result.nodeType === Node.DOCUMENT_FRAGMENT_NODE
            ? <[Node,Node]>[result.firstChild, result.lastChild]
            : result;

        const range = NodeContext.toRange(this.point);

        this.point = result.nodeType === Node.DOCUMENT_FRAGMENT_NODE
            ? <[Node,Node]> [result.firstChild, result.lastChild]
            : result;

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
        else if (!(elm instanceof Component) && name in Object.getPrototypeOf(elm))
            elm[<"id">name] = <string>value;
        else
            elm.setAttribute(name, String(value));
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

/**
 * DOM EventをStreamに変換するクラス。
 * JSHTML内でイベントハンドラ(onclick, onkeydown等)の属性値として設置することで稼働する。
 */
class EventStream<E extends Event> extends StreamSink<E> implements EventListenerObject {

    handleEvent(e: E): void {
        this.send(e);
    }

}


export abstract class Component extends HTMLElement implements WebComponentClass {
    
    abstract render() : NodeSource;

    public shadowContext: NodeContext;
    public shadowEvents: ShadowEventMap;  //{ [key:string]: Stream<Event> };
    public attrChanged : { [key:string]: Stream<string> };

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open'});
        this.shadowContext = new NodeContext(shadow.appendChild(new Comment('[PLACEHOLDER]')));

        const cls = <WebComponentConstructor> this.constructor;

        this.shadowEvents = <ShadowEventMap> new Proxy({}, {
            get: (target,prop,receiver) => {
                if (target.hasOwnProperty(prop)) return Reflect.get(target,prop,receiver);
                if (typeof prop !== 'string') return undefined;
                const s = new EventStream();
                shadow.addEventListener(prop, s);
                Reflect.set(target, prop, s);
                return s;
            }
        });

        this.attrChanged = {};
        if(Array.isArray(cls.observedAttributes))
            cls.observedAttributes.forEach((e) => this.attrChanged[e] = new StreamSink());
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        (<StreamSink<string>>this.attrChanged[name]).send(newValue);
    }

    connectedCallback() {
        this.shadowContext.update(this.render());
    }

    disconnectedCallback() {
        this.shadowContext.update(null);
    }

    get parentComponent() {
        let n = this.parentNode;
        while(n) {
            if(n instanceof Component)
                break;
            else
                n = n instanceof ShadowRoot ? n.host : n.parentNode;
        }
        return n;
    }

}

export default {
    Component
};
