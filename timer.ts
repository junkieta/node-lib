import { StreamSink, Stream } from "./virtue.js";

type Timer = StreamSink<number> & {
    tid: number
    start() : void
    stop() : void
};

export const timer = new StreamSink() as Timer;

timer.start = () => {
    timer.tid = requestAnimationFrame(timer.start);
    timer.send(performance.now());
};

timer.stop = () => {
    cancelAnimationFrame(timer.tid);
};

export function duration(ms: number) : Stream<number> {
    const started = performance.now();
    const stream = timer.map((now) => {
        const elapsed = now - started;
        return elapsed < ms ? elapsed/ms : 1;
    });
    timer.start();
    return stream;
}
