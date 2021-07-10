Stream.merge(that: Stream<A> | Stream<A>[], lambda: (a:A,b:A) => A = Stream.PASS_THROUGH): Stream<A> {
        const inputs = ([this] as Stream<A>[]).concat(that);
        const merged = new Stream<A>(Stream.PASS_THROUGH);
        const EMPTY = Symbol('EMPTY');
        let value : A | symbol = EMPTY;
        inputs.forEach((s) => {
            s.listen((v) => {
                if (value === EMPTY) {
                    value = v;
                    Transaction.currentTransaction[PUSH](() => {
                        StreamPipe.flow(merged, value);
                        value = EMPTY;
                    });
                } else {
                    value = lambda(v, <A>value);
                }
            });
        });
        return merged;
    }
