
import { AsyncIterator, MultiTransformIterator, SimpleTransformIterator } from 'asynciterator';

export class DynamicNestedLoopJoin<L, R, T> extends MultiTransformIterator<L, T>
{
    constructor(left: AsyncIterator<L>, funRight: (left: L) => AsyncIterator<R>, funJoin: (left: L, right: R) => T);

    _createTransformer(leftItem: L): SimpleTransformIterator<L, T>;
}

export class HashJoin<S, H, T> extends AsyncIterator<T>
{
    constructor(left: AsyncIterator<S>, right: AsyncIterator<S>, funHash: (entry: S) => H, funJoin: (left: S, right: S) => T);
    protected hasResults(): boolean;
    close(): void;
    read(): T;
}

export class NestedLoopJoin<L, R, T> extends MultiTransformIterator<L, T>
{
    constructor(left: AsyncIterator<L>, right: AsyncIterator<R>, funJoin: (left: L, right: R) => T);
    close(): void;

    _createTransformer(leftItem: L): SimpleTransformIterator<L, T>;
}

export class SymmetricHashJoin<S, H, T> extends AsyncIterator<T>
{
    constructor(left: AsyncIterator<S>, right: AsyncIterator<S>, funHash: (entry: S) => H, funJoin: (left: S, right: S) => T);
    protected hasResults(): boolean;
    close(): void;
    read(): T;
}

export class MergeIterator<T> extends AsyncIterator<T>
{
    constructor(streams: T[]);
    protected _removeStream(stream: T): void;
    close(): void;
    read(): T;
}