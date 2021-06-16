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
    private static cellUpdates : Function[] = [];
    private static endCallback : Function[] = [];

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

    constructor(callback?: ((value: any) => A | Promise<A>) | Promise<A>) {
        if (callback instanceof Promise) {
            this._apply = Stream.PASS_THROUGH;
            callback.then((v) => this[PUSH](v));
        } else {
            this._apply = typeof callback === 'function' ? callback : never._apply;
        }
    }

    [PUSH](value: any | Promise<any>) {
        if (value instanceof Promise) {
            value.then((v) => this[PUSH](v));
        } else {
            try {
                const r = this._apply(value);
                Pipeline.getConnections(this).forEach(c => c[PUSH](r));
            } catch (err) {
                if (!(err instanceof StreamingError)) throw err;
            }
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
    map<B>(action: (arg: A) => B | Promise<B>): Stream<B> {
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
        const s = new Stream<A>(Stream.PASS_THROUGH);
        cell.listen((v) => {
            Pipeline.disconnect(cell.valueOf(), s);
            Pipeline.connect(v, s);
        });
        return s;
    }

    private _value: A;
    private _stream: Stream<A>;

    constructor(init: A, stream?: Stream<A>) {
        this._value = init;
        this._stream = stream instanceof Stream ? stream : never;
    }

    /**
     * 現在のトランザクション終了時に値が代入されるようにする。
     */
    [PUSH](value: A | Promise<A>): void {
        if (value instanceof Promise) {
            value.then((v) => this[PUSH](v));
        } else {
            Transaction.enqueueUpdateCell(() => this._value = value);
            Pipeline.getConnections(this).forEach(c => c[PUSH](value));
        }
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

export default {
    Stream,
    StreamLoop,
    StreamSink,
    Cell,
    CellSink,
    CellLoop,
    Transaction
};
