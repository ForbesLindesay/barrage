/// <reference types="node" />
import * as streams from 'stream';
export interface WritableOptions<T> {
    highWaterMark?: number;
    decodeStrings?: boolean;
    objectMode?: boolean;
    write: (chunk: T, encoding: string, callback: Function) => any;
    writev?: (chunks: {
        chunk: T;
        encoding: string;
    }[], callback: Function) => any;
    destroy?: (error?: Error) => any;
}
export interface WritableStream<T> {
    emit(name: 'error', err: Error): void;
    write(chunk: T, cb?: Function): boolean;
    write(chunk: T, encoding?: string, cb?: Function): boolean;
}
export declare class Writable<T = Buffer> extends streams.Writable implements WritableStream<T> {
    constructor(options: WritableOptions<T>);
    write(chunk: T, cb?: Function): boolean;
    write(chunk: T, encoding?: string, cb?: Function): boolean;
    untyped(): NodeJS.WritableStream;
    wait(): Promise<void>;
}
export interface ReadableStream<T> {
    on(event: "close", listener: () => void): this;
    on(event: "data", listener: (chunk: T) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "readable", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    syphon<TStream extends WritableStream<T>>(destination: TStream, options?: {
        end?: boolean;
    }): TStream;
    buffer(): Promise<T[]>;
    buffer(encoding: 'buffer'): Promise<Buffer>;
    buffer(encoding: 'utf8'): Promise<string>;
    flatMap<TResult>(transform: (chunk: T) => TResult[] | PromiseLike<TResult[]> | ReadableStream<TResult>, options?: FlatMapOptions): ReadableStream<TResult>;
    map<TResult>(transform: (chunk: T) => TResult | PromiseLike<TResult>, options?: FlatMapOptions): ReadableStream<TResult>;
    filter(transform: (chunk: T) => boolean | PromiseLike<boolean>, options?: FlatMapOptions): ReadableStream<T>;
    bufferTransform<TOutput>(transform: (input: T[]) => TOutput | PromiseLike<TOutput>): ReadableStream<TOutput>;
    bufferTransform<TOutput>(transform: (input: Buffer) => TOutput | PromiseLike<TOutput>, encoding: 'buffer'): ReadableStream<TOutput>;
    bufferTransform<TOutput>(transform: (input: string) => TOutput | PromiseLike<TOutput>, encoding: 'utf8'): ReadableStream<TOutput>;
}
export interface ReadableOptions<T> {
    highWaterMark?: number;
    encoding?: string;
    objectMode?: boolean;
    read?: (this: Readable<T>, size: number | void, push: (chunk: T | null, encoding?: string) => boolean) => any;
    destroy?: (error?: Error) => any;
}
export declare class Readable<T = Buffer> extends streams.Readable implements ReadableStream<T> {
    private _push;
    constructor(options?: ReadableOptions<T>);
    on(event: "close", listener: () => void): this;
    on(event: "data", listener: (chunk: Buffer | string) => void): this;
    on(event: "data", listener: (chunk: T) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "readable", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    pipe<TStream extends NodeJS.WritableStream>(destination: TStream, options?: {
        end?: boolean;
    }): TStream;
    pipe<TStream extends WritableStream<T>>(destination: TStream, options?: {
        end?: boolean;
    }): TStream;
    syphon<TStream extends NodeJS.WritableStream>(destination: TStream, options?: {
        end?: boolean;
    }): TStream;
    syphon<TStream extends WritableStream<T>>(destination: TStream, options?: {
        end?: boolean;
    }): TStream;
    unpipe(destination?: NodeJS.WritableStream): this;
    unpipe(destination?: WritableStream<T>): this;
    push(chunk: T | null, encoding?: string): boolean;
    buffer(): Promise<T[]>;
    buffer(encoding: 'buffer'): Promise<Buffer>;
    buffer(encoding: 'utf8'): Promise<string>;
    flatMap<TResult>(transform: (chunk: T) => TResult[] | PromiseLike<TResult[]> | ReadableStream<TResult>, options?: FlatMapOptions): ReadableStream<TResult>;
    map<TResult>(transform: (chunk: T) => TResult | PromiseLike<TResult>, options?: FlatMapOptions): ReadableStream<TResult>;
    filter(transform: (chunk: T) => boolean | PromiseLike<boolean>, options?: FlatMapOptions): ReadableStream<T>;
    bufferTransform<TOutput>(transform: (input: T[]) => TOutput | PromiseLike<TOutput>): ReadableStream<TOutput>;
    bufferTransform<TOutput>(transform: (input: Buffer) => TOutput | PromiseLike<TOutput>, encoding: 'buffer'): ReadableStream<TOutput>;
    bufferTransform<TOutput>(transform: (input: string) => TOutput | PromiseLike<TOutput>, encoding: 'utf8'): ReadableStream<TOutput>;
}
export interface DuplexStream<TWrite, TRead = TWrite> extends WritableStream<TWrite>, ReadableStream<TRead> {
}
export declare class PassThrough<T> extends streams.PassThrough implements DuplexStream<T> {
    write(chunk: T, cb?: Function): boolean;
    write(chunk: T, encoding?: string, cb?: Function): boolean;
    untyped(): NodeJS.WritableStream;
    wait(): Promise<{}>;
    on(event: "close", listener: () => void): this;
    on(event: "data", listener: (chunk: Buffer | string) => void): this;
    on(event: "data", listener: (chunk: T) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "readable", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    pipe<TStream extends NodeJS.WritableStream>(destination: TStream, options?: {
        end?: boolean;
    }): TStream;
    pipe<TStream extends WritableStream<T>>(destination: TStream, options?: {
        end?: boolean;
    }): TStream;
    syphon<TStream extends NodeJS.WritableStream>(destination: TStream, options?: {
        end?: boolean;
    }): TStream;
    syphon<TStream extends WritableStream<T>>(destination: TStream, options?: {
        end?: boolean;
    }): TStream;
    unpipe(destination?: NodeJS.WritableStream): this;
    unpipe(destination?: WritableStream<T>): this;
    push(chunk: T | null, encoding?: string): boolean;
    buffer(): Promise<T[]>;
    buffer(encoding: 'buffer'): Promise<Buffer>;
    buffer(encoding: 'utf8'): Promise<string>;
    flatMap<TResult>(transform: (chunk: T) => TResult[] | PromiseLike<TResult[]> | ReadableStream<TResult>, options?: FlatMapOptions): ReadableStream<TResult>;
    map<TResult>(transform: (chunk: T) => TResult | PromiseLike<TResult>, options?: FlatMapOptions): ReadableStream<TResult>;
    filter(transform: (chunk: T) => boolean | PromiseLike<boolean>, options?: FlatMapOptions): ReadableStream<T>;
    bufferTransform<TOutput>(transform: (input: T[]) => TOutput | PromiseLike<TOutput>): ReadableStream<TOutput>;
    bufferTransform<TOutput>(transform: (input: Buffer) => TOutput | PromiseLike<TOutput>, encoding: 'buffer'): ReadableStream<TOutput>;
    bufferTransform<TOutput>(transform: (input: string) => TOutput | PromiseLike<TOutput>, encoding: 'utf8'): ReadableStream<TOutput>;
}
export interface DuplexOptions<TWrite, TRead> extends WritableOptions<TWrite>, ReadableOptions<TRead> {
    allowHalfOpen?: boolean;
    readableObjectMode?: boolean;
    writableObjectMode?: boolean;
}
export declare class Duplex<TWrite, TRead> extends streams.Duplex implements DuplexStream<TWrite, TRead> {
    private _push;
    constructor(options: DuplexOptions<TWrite, TRead>);
    write(chunk: TWrite, cb?: Function): boolean;
    write(chunk: TWrite, encoding?: string, cb?: Function): boolean;
    untyped(): NodeJS.WritableStream;
    wait(): Promise<{}>;
    on(event: "close", listener: () => void): this;
    on(event: "data", listener: (chunk: Buffer | string) => void): this;
    on(event: "data", listener: (chunk: TRead) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "readable", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    pipe<TStream extends NodeJS.WritableStream>(destination: TStream, options?: {
        end?: boolean;
    }): TStream;
    pipe<TStream extends WritableStream<TRead>>(destination: TStream, options?: {
        end?: boolean;
    }): TStream;
    syphon<TStream extends NodeJS.WritableStream>(destination: TStream, options?: {
        end?: boolean;
    }): TStream;
    syphon<TStream extends WritableStream<TRead>>(destination: TStream, options?: {
        end?: boolean;
    }): TStream;
    unpipe(destination?: NodeJS.WritableStream): this;
    unpipe(destination?: WritableStream<TRead>): this;
    push(chunk: TRead | null, encoding?: string): boolean;
    buffer(): Promise<TRead[]>;
    buffer(encoding: 'buffer'): Promise<Buffer>;
    buffer(encoding: 'utf8'): Promise<string>;
    flatMap<TResult>(transform: (chunk: TRead) => TResult[] | PromiseLike<TResult[]> | ReadableStream<TResult>, options?: FlatMapOptions): ReadableStream<TResult>;
    map<TResult>(transform: (chunk: TRead) => TResult | PromiseLike<TResult>, options?: FlatMapOptions): ReadableStream<TResult>;
    filter(transform: (chunk: TRead) => boolean | PromiseLike<boolean>, options?: FlatMapOptions): ReadableStream<TRead>;
    bufferTransform<TOutput>(transform: (input: TRead[]) => TOutput | PromiseLike<TOutput>): ReadableStream<TOutput>;
    bufferTransform<TOutput>(transform: (input: Buffer) => TOutput | PromiseLike<TOutput>, encoding: 'buffer'): ReadableStream<TOutput>;
    bufferTransform<TOutput>(transform: (input: string) => TOutput | PromiseLike<TOutput>, encoding: 'utf8'): ReadableStream<TOutput>;
}
export interface WritableOptions<T> {
    highWaterMark?: number;
    decodeStrings?: boolean;
    objectMode?: boolean;
    write: (chunk: T, encoding: string, callback: Function) => any;
    writev?: (chunks: {
        chunk: T;
        encoding: string;
    }[], callback: Function) => any;
    destroy?: (error?: Error) => any;
}
export interface TransformOptionsBase {
    highWaterMark?: number;
    decodeStrings?: boolean;
    destroy?: (error?: Error) => any;
    encoding?: string;
    allowHalfOpen?: boolean;
    readableObjectMode?: boolean;
    writableObjectMode?: boolean;
}
export interface FlatMapOptions extends TransformOptionsBase {
    parallel?: number;
}
export interface TransformOptions<TWrite, TRead> extends TransformOptionsBase {
    transform: (chunk: TWrite, encoding: string, push: (chunk: TRead, encoding?: string) => boolean, callback: (err?: null | Error, chunk?: TRead) => void) => any;
    flush?: (push: (chunk: TRead, encoding?: string) => boolean, callback: (err?: null | Error, chunk?: TRead) => void) => any;
}
export declare class Transform<TWrite, TRead> extends streams.Transform implements DuplexStream<TWrite, TRead> {
    private _push;
    constructor(options: TransformOptions<TWrite, TRead>);
    write(chunk: TWrite, cb?: Function): boolean;
    write(chunk: TWrite, encoding?: string, cb?: Function): boolean;
    untyped(): NodeJS.WritableStream;
    wait(): Promise<{}>;
    on(event: "close", listener: () => void): this;
    on(event: "data", listener: (chunk: Buffer | string) => void): this;
    on(event: "data", listener: (chunk: TRead) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "readable", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    pipe<TStream extends NodeJS.WritableStream>(destination: TStream, options?: {
        end?: boolean;
    }): TStream;
    pipe<TStream extends WritableStream<TRead>>(destination: TStream, options?: {
        end?: boolean;
    }): TStream;
    syphon<TStream extends NodeJS.WritableStream>(destination: TStream, options?: {
        end?: boolean;
    }): TStream;
    syphon<TStream extends WritableStream<TRead>>(destination: TStream, options?: {
        end?: boolean;
    }): TStream;
    unpipe(destination?: NodeJS.WritableStream): this;
    unpipe(destination?: WritableStream<TRead>): this;
    push(chunk: TRead, encoding?: string): boolean;
    buffer(): Promise<TRead[]>;
    buffer(encoding: 'buffer'): Promise<Buffer>;
    buffer(encoding: 'utf8'): Promise<string>;
    flatMap<TResult>(transform: (chunk: TRead) => TResult[] | PromiseLike<TResult[]> | ReadableStream<TResult>, options?: FlatMapOptions): ReadableStream<TResult>;
    map<TResult>(transform: (chunk: TRead) => TResult | PromiseLike<TResult>, options?: FlatMapOptions): ReadableStream<TResult>;
    filter(transform: (chunk: TRead) => boolean | PromiseLike<boolean>, options?: FlatMapOptions): ReadableStream<TRead>;
    bufferTransform<TOutput>(transform: (input: TRead[]) => TOutput | PromiseLike<TOutput>): ReadableStream<TOutput>;
    bufferTransform<TOutput>(transform: (input: Buffer) => TOutput | PromiseLike<TOutput>, encoding: 'buffer'): ReadableStream<TOutput>;
    bufferTransform<TOutput>(transform: (input: string) => TOutput | PromiseLike<TOutput>, encoding: 'utf8'): ReadableStream<TOutput>;
}
export declare class FlatMap<TWrite, TRead> extends Transform<TWrite, TRead> {
    private _ready;
    private _nextError;
    constructor(transform: (chunk: TWrite) => TRead[] | PromiseLike<TRead[]> | ReadableStream<TRead>, options?: FlatMapOptions);
}
export declare class Map<TWrite, TRead> extends FlatMap<TWrite, TRead> {
    constructor(transform: (chunk: TWrite) => TRead | PromiseLike<TRead>, options?: FlatMapOptions);
}
export declare class Filter<T> extends FlatMap<T, T> {
    constructor(transform: (chunk: T) => boolean | PromiseLike<boolean>, options?: FlatMapOptions);
}
export declare class BufferTransform<TInput = Buffer | string, TOutput = Buffer | string> extends Transform<TInput, TOutput> {
    private _buffer;
    constructor(transform: (input: TInput[]) => TOutput | PromiseLike<TOutput>);
    constructor(transform: (input: Buffer) => TOutput | PromiseLike<TOutput>, encoding: 'buffer');
    constructor(transform: (input: string) => TOutput | PromiseLike<TOutput>, encoding: 'utf8');
}
