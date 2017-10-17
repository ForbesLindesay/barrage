import * as streams from 'stream';
import isPromise = require('is-promise');

export interface WritableOptions<T> {
  highWaterMark?: number;
  decodeStrings?: boolean;
  objectMode?: boolean;
  write: (chunk: T, encoding: string, callback: (error?: Error) => void) => any;
  writev?: (
    chunks: {chunk: T; encoding: string}[],
    callback: (error?: Error) => void,
  ) => any;
  destroy?: (error?: Error) => any;
  final?: (callback: (error?: Error) => void) => any;
}
export interface WritableStream<T> {
  emit(name: 'error', err: Error): void;
  write(chunk: T, cb?: Function): boolean;
  write(chunk: T, encoding?: string, cb?: Function): boolean;
  untyped(): NodeJS.WritableStream;
  wait(): Promise<void>;
}

export class Writable<T = Buffer> extends streams.Writable
  implements WritableStream<T> {
  constructor(options: WritableOptions<T>) {
    super(options as any);
  }
  write(chunk: T, cb?: Function): boolean;
  write(chunk: T, encoding?: string, cb?: Function): boolean;
  write(...args: any[]): boolean {
    return (super.write as any)(...args);
  }
  untyped(): NodeJS.WritableStream {
    return this as any;
  }
  wait() {
    return new Promise<void>((resolve, reject) => {
      this.on('error', reject);
      this.on('end', resolve);
      this.on('finish', resolve);
      this.on('close', resolve);
    });
  }

  static fromStream<T>(stream: NodeJS.WritableStream): WritableStream<T> {
    const s = stream as any;

    s.wait = Duplex.prototype.wait;
    s.untyped = Duplex.prototype.untyped;

    return s;
  }
}

export interface ReadableStream<T> {
  on(event: 'close', listener: () => void): this;
  on(event: 'data', listener: (chunk: T) => void): this;
  on(event: 'end', listener: () => void): this;
  on(event: 'readable', listener: () => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  syphon<TStream extends WritableStream<T>>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream;
  buffer(): Promise<T[]>;
  buffer(encoding: 'buffer'): Promise<Buffer>;
  buffer(encoding: 'utf8'): Promise<string>;

  flatMap<TResult>(
    transform: (
      chunk: T,
    ) => TResult[] | PromiseLike<TResult[]> | ReadableStream<TResult>,
    options?: FlatMapOptions,
  ): ReadableStream<TResult>;
  map<TResult>(
    transform: (chunk: T) => TResult | PromiseLike<TResult>,
    options?: FlatMapOptions,
  ): ReadableStream<TResult>;
  filter(
    transform: (chunk: T) => boolean | PromiseLike<boolean>,
    options?: FlatMapOptions,
  ): ReadableStream<T>;
  bufferTransform<TOutput>(
    transform: (input: T[]) => TOutput | PromiseLike<TOutput>,
  ): ReadableStream<TOutput>;
  bufferTransform<TOutput>(
    transform: (input: Buffer) => TOutput | PromiseLike<TOutput>,
    encoding: 'buffer',
  ): ReadableStream<TOutput>;
  bufferTransform<TOutput>(
    transform: (input: string) => TOutput | PromiseLike<TOutput>,
    encoding: 'utf8',
  ): ReadableStream<TOutput>;

  untyped(): NodeJS.ReadableStream;
}

function isReadableStream(stream: any): stream is ReadableStream<any> {
  return typeof stream.on === 'function' && typeof stream.syphon === 'function';
}

export interface ReadableOptions<T> {
  highWaterMark?: number;
  encoding?: string;
  objectMode?: boolean;
  read?: (
    this: Readable<T>,
    size: number | void,
    push: (chunk: T | null, encoding?: string) => boolean,
  ) => any;
  destroy?: (error?: Error) => any;
}
export class Readable<T = Buffer> extends streams.Readable
  implements ReadableStream<T> {
  private _push = (chunk: T | null, encoding?: string): boolean =>
    this.push(chunk, encoding);
  constructor(options: ReadableOptions<T> = {}) {
    super({
      ...options,
      read: size => {
        if (options.read) {
          return options.read.call(this, size, this._push);
        }
      },
    });
  }

  on(event: 'close', listener: () => void): this;
  on(event: 'data', listener: (chunk: Buffer | string) => void): this;
  on(event: 'data', listener: (chunk: T) => void): this;
  on(event: 'end', listener: () => void): this;
  on(event: 'readable', listener: () => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  pipe<TStream extends NodeJS.WritableStream>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream;
  pipe<TStream extends WritableStream<T>>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream;
  pipe<TStream extends WritableStream<T> | NodeJS.WritableStream>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream {
    return super.pipe(destination as any, options);
  }
  syphon<TStream extends NodeJS.WritableStream>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream;
  syphon<TStream extends WritableStream<T>>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream;
  syphon<TStream extends WritableStream<T> | NodeJS.WritableStream>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream {
    this.on('error', destination.emit.bind(destination, 'error'));
    return this.pipe(destination as any, options);
  }

  unpipe(destination?: NodeJS.WritableStream): this;
  unpipe(destination?: WritableStream<T>): this;
  unpipe(destination?: WritableStream<T> | NodeJS.WritableStream): this {
    return super.unpipe(destination as any);
  }
  push(chunk: T | null, encoding?: string): boolean {
    return super.push(chunk, encoding);
  }

  buffer(): Promise<T[]>;
  buffer(encoding: 'buffer'): Promise<Buffer>;
  buffer(encoding: 'utf8'): Promise<string>;
  buffer(encoding?: string): Promise<T[] | Buffer | string> {
    const buffer: T[] = [];
    const destination = new Writable({
      objectMode: !encoding,
      write(chunk: T, encoding: string, callback: Function) {
        buffer.push(chunk);
        callback();
      },
    });
    this.syphon(destination);
    return destination.wait().then(() => {
      if (encoding === 'buffer') {
        return Buffer.concat(buffer.map(toBuffer));
      }
      if (encoding === 'utf8') {
        return Buffer.concat(buffer.map(toBuffer)).toString('utf8');
      }
      return buffer;
    });
  }

  flatMap<TResult>(
    transform: (
      chunk: T,
    ) => TResult[] | PromiseLike<TResult[]> | ReadableStream<TResult>,
    options?: FlatMapOptions,
  ): ReadableStream<TResult> {
    return this.syphon(new FlatMap<T, TResult>(transform, options));
  }
  map<TResult>(
    transform: (chunk: T) => TResult | PromiseLike<TResult>,
    options?: FlatMapOptions,
  ): ReadableStream<TResult> {
    return this.syphon(new Map<T, TResult>(transform, options));
  }
  filter(
    transform: (chunk: T) => boolean | PromiseLike<boolean>,
    options?: FlatMapOptions,
  ): ReadableStream<T> {
    return this.syphon(new Filter<T>(transform, options));
  }
  bufferTransform<TOutput>(
    transform: (input: T[]) => TOutput | PromiseLike<TOutput>,
  ): ReadableStream<TOutput>;
  bufferTransform<TOutput>(
    transform: (input: Buffer) => TOutput | PromiseLike<TOutput>,
    encoding: 'buffer',
  ): ReadableStream<TOutput>;
  bufferTransform<TOutput>(
    transform: (input: string) => TOutput | PromiseLike<TOutput>,
    encoding: 'utf8',
  ): ReadableStream<TOutput>;
  bufferTransform<TOutput>(
    transform: (input: any) => TOutput | PromiseLike<TOutput>,
    encoding?: 'buffer' | 'utf8',
  ): ReadableStream<TOutput> {
    return this.syphon(
      new BufferTransform<T, TOutput>(transform, encoding as any),
    );
  }

  untyped(): NodeJS.ReadableStream {
    return this as any;
  }

  static fromStream<T>(stream: NodeJS.ReadableStream): ReadableStream<T> {
    const s = stream as any;

    s.syphon = Readable.prototype.syphon;
    s.buffer = Readable.prototype.buffer;
    s.flatMap = Readable.prototype.flatMap;
    s.map = Readable.prototype.map;
    s.filter = Readable.prototype.filter;
    s.bufferTransform = Readable.prototype.bufferTransform;
    s.untyped = Readable.prototype.untyped;

    return s;
  }
}

function toBuffer(value: any): Buffer {
  if (Buffer.isBuffer(value)) {
    return value;
  }
  return Buffer.from(value);
}

export interface DuplexStream<TWrite, TRead = TWrite>
  extends WritableStream<TWrite>,
    ReadableStream<TRead> {
  untyped(): NodeJS.ReadableStream & NodeJS.WritableStream;
}
export class PassThrough<T> extends streams.PassThrough
  implements DuplexStream<T> {
  // Writeable
  write(chunk: T, cb?: Function): boolean;
  write(chunk: T, encoding?: string, cb?: Function): boolean;
  write(...args: any[]): boolean {
    return (super.write as any)(...args);
  }
  untyped(): NodeJS.WritableStream & NodeJS.ReadableStream {
    return this as any;
  }
  wait() {
    return new Promise<void>((resolve, reject) => {
      this.on('error', reject);
      this.on('end', resolve);
      (this as any).on('finish', resolve);
      this.on('close', resolve);
    });
  }

  // Readable
  on(event: 'close', listener: () => void): this;
  on(event: 'data', listener: (chunk: Buffer | string) => void): this;
  on(event: 'data', listener: (chunk: T) => void): this;
  on(event: 'end', listener: () => void): this;
  on(event: 'readable', listener: () => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  pipe<TStream extends NodeJS.WritableStream>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream;
  pipe<TStream extends WritableStream<T>>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream;
  pipe<TStream extends WritableStream<T> | NodeJS.WritableStream>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream {
    return super.pipe(destination as any, options);
  }
  syphon<TStream extends NodeJS.WritableStream>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream;
  syphon<TStream extends WritableStream<T>>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream;
  syphon<TStream extends WritableStream<T> | NodeJS.WritableStream>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream {
    this.on('error', destination.emit.bind(destination, 'error'));
    return this.pipe(destination as any, options);
  }

  unpipe(destination?: NodeJS.WritableStream): this;
  unpipe(destination?: WritableStream<T>): this;
  unpipe(destination?: WritableStream<T> | NodeJS.WritableStream): this {
    return super.unpipe(destination as any);
  }
  push(chunk: T | null, encoding?: string): boolean {
    return super.push(chunk, encoding);
  }

  buffer(): Promise<T[]>;
  buffer(encoding: 'buffer'): Promise<Buffer>;
  buffer(encoding: 'utf8'): Promise<string>;
  buffer(encoding?: string): Promise<T[] | Buffer | string> {
    const buffer: T[] = [];
    const destination = new Writable({
      objectMode: !encoding,
      write(chunk: T, encoding: string, callback: Function) {
        buffer.push(chunk);
        callback();
      },
    });
    this.syphon(destination);
    return destination.wait().then(() => {
      if (encoding === 'buffer') {
        return Buffer.concat(buffer.map(toBuffer));
      }
      if (encoding === 'utf8') {
        return Buffer.concat(buffer.map(toBuffer)).toString('utf8');
      }
      return buffer;
    });
  }

  flatMap<TResult>(
    transform: (
      chunk: T,
    ) => TResult[] | PromiseLike<TResult[]> | ReadableStream<TResult>,
    options?: FlatMapOptions,
  ): ReadableStream<TResult> {
    return this.syphon(new FlatMap<T, TResult>(transform, options));
  }
  map<TResult>(
    transform: (chunk: T) => TResult | PromiseLike<TResult>,
    options?: FlatMapOptions,
  ): ReadableStream<TResult> {
    return this.syphon(new Map<T, TResult>(transform, options));
  }
  filter(
    transform: (chunk: T) => boolean | PromiseLike<boolean>,
    options?: FlatMapOptions,
  ): ReadableStream<T> {
    return this.syphon(new Filter<T>(transform, options));
  }
  bufferTransform<TOutput>(
    transform: (input: T[]) => TOutput | PromiseLike<TOutput>,
  ): ReadableStream<TOutput>;
  bufferTransform<TOutput>(
    transform: (input: Buffer) => TOutput | PromiseLike<TOutput>,
    encoding: 'buffer',
  ): ReadableStream<TOutput>;
  bufferTransform<TOutput>(
    transform: (input: string) => TOutput | PromiseLike<TOutput>,
    encoding: 'utf8',
  ): ReadableStream<TOutput>;
  bufferTransform<TOutput>(
    transform: (input: any) => TOutput | PromiseLike<TOutput>,
    encoding?: 'buffer' | 'utf8',
  ): ReadableStream<TOutput> {
    return this.syphon(
      new BufferTransform<T, TOutput>(transform, encoding as any),
    );
  }
}

export interface DuplexOptions<TWrite, TRead>
  extends WritableOptions<TWrite>,
    ReadableOptions<TRead> {
  allowHalfOpen?: boolean;
  readableObjectMode?: boolean;
  writableObjectMode?: boolean;
}
export class Duplex<TWrite, TRead> extends streams.Duplex
  implements DuplexStream<TWrite, TRead> {
  private _push = (chunk: TRead | null, encoding?: string): boolean =>
    this.push(chunk, encoding);
  constructor(options: DuplexOptions<TWrite, TRead>) {
    super({
      ...(options as any),
      read: size => {
        if (options.read) {
          return options.read.call(this, size, this._push);
        }
      },
    });
  }

  // Writeable
  write(chunk: TWrite, cb?: Function): boolean;
  write(chunk: TWrite, encoding?: string, cb?: Function): boolean;
  write(...args: any[]): boolean {
    return (super.write as any)(...args);
  }
  untyped(): NodeJS.WritableStream & NodeJS.ReadableStream {
    return this as any;
  }
  wait() {
    return new Promise<void>((resolve, reject) => {
      this.on('error', reject);
      this.on('end', resolve);
      (this as any).on('finish', resolve);
      this.on('close', resolve);
    });
  }

  // Readable
  on(event: 'close', listener: () => void): this;
  on(event: 'data', listener: (chunk: Buffer | string) => void): this;
  on(event: 'data', listener: (chunk: TRead) => void): this;
  on(event: 'end', listener: () => void): this;
  on(event: 'readable', listener: () => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  pipe<TStream extends NodeJS.WritableStream>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream;
  pipe<TStream extends WritableStream<TRead>>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream;
  pipe<TStream extends WritableStream<TRead> | NodeJS.WritableStream>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream {
    return super.pipe(destination as any, options);
  }
  syphon<TStream extends NodeJS.WritableStream>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream;
  syphon<TStream extends WritableStream<TRead>>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream;
  syphon<TStream extends WritableStream<TRead> | NodeJS.WritableStream>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream {
    this.on('error', destination.emit.bind(destination, 'error'));
    return this.pipe(destination as any, options);
  }

  unpipe(destination?: NodeJS.WritableStream): this;
  unpipe(destination?: WritableStream<TRead>): this;
  unpipe(destination?: WritableStream<TRead> | NodeJS.WritableStream): this {
    return super.unpipe(destination as any);
  }
  push(chunk: TRead | null, encoding?: string): boolean {
    return super.push(chunk, encoding);
  }

  buffer(): Promise<TRead[]>;
  buffer(encoding: 'buffer'): Promise<Buffer>;
  buffer(encoding: 'utf8'): Promise<string>;
  buffer(encoding?: string): Promise<TRead[] | Buffer | string> {
    const buffer: TRead[] = [];
    const destination = new Writable({
      objectMode: !encoding,
      write(chunk: TRead, encoding: string, callback: Function) {
        buffer.push(chunk);
        callback();
      },
    });
    this.syphon(destination);
    return destination.wait().then(() => {
      if (encoding === 'buffer') {
        return Buffer.concat(buffer.map(toBuffer));
      }
      if (encoding === 'utf8') {
        return Buffer.concat(buffer.map(toBuffer)).toString('utf8');
      }
      return buffer;
    });
  }
  flatMap<TResult>(
    transform: (
      chunk: TRead,
    ) => TResult[] | PromiseLike<TResult[]> | ReadableStream<TResult>,
    options?: FlatMapOptions,
  ): ReadableStream<TResult> {
    return this.syphon(new FlatMap<TRead, TResult>(transform, options));
  }
  map<TResult>(
    transform: (chunk: TRead) => TResult | PromiseLike<TResult>,
    options?: FlatMapOptions,
  ): ReadableStream<TResult> {
    return this.syphon(new Map<TRead, TResult>(transform, options));
  }
  filter(
    transform: (chunk: TRead) => boolean | PromiseLike<boolean>,
    options?: FlatMapOptions,
  ): ReadableStream<TRead> {
    return this.syphon(new Filter<TRead>(transform, options));
  }
  bufferTransform<TOutput>(
    transform: (input: TRead[]) => TOutput | PromiseLike<TOutput>,
  ): ReadableStream<TOutput>;
  bufferTransform<TOutput>(
    transform: (input: Buffer) => TOutput | PromiseLike<TOutput>,
    encoding: 'buffer',
  ): ReadableStream<TOutput>;
  bufferTransform<TOutput>(
    transform: (input: string) => TOutput | PromiseLike<TOutput>,
    encoding: 'utf8',
  ): ReadableStream<TOutput>;
  bufferTransform<TOutput>(
    transform: (input: any) => TOutput | PromiseLike<TOutput>,
    encoding?: 'buffer' | 'utf8',
  ): ReadableStream<TOutput> {
    return this.syphon(
      new BufferTransform<TRead, TOutput>(transform, encoding as any),
    );
  }

  static fromStream<TWrite = Buffer, TRead = TWrite>(
    stream: NodeJS.ReadableStream & NodeJS.WritableStream,
  ): DuplexStream<TWrite, TRead> {
    const s = stream as any;

    s.wait = Duplex.prototype.wait;

    s.syphon = Duplex.prototype.syphon;
    s.buffer = Duplex.prototype.buffer;
    s.flatMap = Duplex.prototype.flatMap;
    s.map = Duplex.prototype.map;
    s.filter = Duplex.prototype.filter;
    s.bufferTransform = Duplex.prototype.bufferTransform;

    s.untyped = Duplex.prototype.untyped;

    return s;
  }
}

export interface TransformOptionsBase {
  // writeable
  highWaterMark?: number;
  decodeStrings?: boolean;
  destroy?: (error?: Error) => any;
  // readable
  encoding?: string;
  // duplex
  allowHalfOpen?: boolean;
  readableObjectMode?: boolean;
  writableObjectMode?: boolean;
}
export interface FlatMapOptions extends TransformOptionsBase {
  parallel?: number;
}
export interface TransformOptions<TWrite, TRead> extends TransformOptionsBase {
  // transform
  transform: (
    chunk: TWrite,
    encoding: string,
    push: (chunk: TRead, encoding?: string) => boolean,
    callback: (err?: null | Error, chunk?: TRead) => void,
  ) => any;
  flush?: (
    push: (chunk: TRead, encoding?: string) => boolean,
    callback: (err?: null | Error, chunk?: TRead) => void,
  ) => any;
}
export class Transform<TWrite, TRead> extends streams.Transform
  implements DuplexStream<TWrite, TRead> {
  private _push = (chunk: TRead, encoding?: string): boolean =>
    this.push(chunk, encoding);
  constructor(options: TransformOptions<TWrite, TRead>) {
    super({
      ...(options as any),
      transform: (chunk: TWrite, encoding: string, callback: Function) => {
        return options.transform.call(
          this,
          chunk,
          encoding,
          this._push,
          callback,
        );
      },
      flush: (callback: Function) => {
        if (options.flush) {
          return options.flush.call(this, this._push, callback);
        } else {
          callback();
        }
      },
    });
  }

  // Writeable
  write(chunk: TWrite, cb?: Function): boolean;
  write(chunk: TWrite, encoding?: string, cb?: Function): boolean;
  write(...args: any[]): boolean {
    return (super.write as any)(...args);
  }
  untyped(): NodeJS.WritableStream & NodeJS.ReadableStream {
    return this as any;
  }
  wait() {
    return new Promise<void>((resolve, reject) => {
      this.on('error', reject);
      this.on('end', resolve);
      (this as any).on('finish', resolve);
      this.on('close', resolve);
    });
  }

  // Readable
  on(event: 'close', listener: () => void): this;
  on(event: 'data', listener: (chunk: Buffer | string) => void): this;
  on(event: 'data', listener: (chunk: TRead) => void): this;
  on(event: 'end', listener: () => void): this;
  on(event: 'readable', listener: () => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  pipe<TStream extends NodeJS.WritableStream>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream;
  pipe<TStream extends WritableStream<TRead>>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream;
  pipe<TStream extends WritableStream<TRead> | NodeJS.WritableStream>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream {
    return super.pipe(destination as any, options);
  }
  syphon<TStream extends NodeJS.WritableStream>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream;
  syphon<TStream extends WritableStream<TRead>>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream;
  syphon<TStream extends WritableStream<TRead> | NodeJS.WritableStream>(
    destination: TStream,
    options?: {end?: boolean},
  ): TStream {
    this.on('error', destination.emit.bind(destination, 'error'));
    return this.pipe(destination as any, options);
  }

  unpipe(destination?: NodeJS.WritableStream): this;
  unpipe(destination?: WritableStream<TRead>): this;
  unpipe(destination?: WritableStream<TRead> | NodeJS.WritableStream): this {
    return super.unpipe(destination as any);
  }
  push(chunk: TRead, encoding?: string): boolean {
    return super.push(chunk, encoding);
  }

  buffer(): Promise<TRead[]>;
  buffer(encoding: 'buffer'): Promise<Buffer>;
  buffer(encoding: 'utf8'): Promise<string>;
  buffer(encoding?: string): Promise<TRead[] | Buffer | string> {
    const buffer: TRead[] = [];
    const destination = new Writable({
      objectMode: !encoding,
      write(chunk: TRead, encoding: string, callback: Function) {
        buffer.push(chunk);
        callback();
      },
    });
    this.syphon(destination);
    return destination.wait().then(() => {
      if (encoding === 'buffer') {
        return Buffer.concat(buffer.map(toBuffer));
      }
      if (encoding === 'utf8') {
        return Buffer.concat(buffer.map(toBuffer)).toString('utf8');
      }
      return buffer;
    });
  }

  flatMap<TResult>(
    transform: (
      chunk: TRead,
    ) => TResult[] | PromiseLike<TResult[]> | ReadableStream<TResult>,
    options?: FlatMapOptions,
  ): ReadableStream<TResult> {
    return this.syphon(new FlatMap<TRead, TResult>(transform, options));
  }
  map<TResult>(
    transform: (chunk: TRead) => TResult | PromiseLike<TResult>,
    options?: FlatMapOptions,
  ): ReadableStream<TResult> {
    return this.syphon(new Map<TRead, TResult>(transform, options));
  }
  filter(
    transform: (chunk: TRead) => boolean | PromiseLike<boolean>,
    options?: FlatMapOptions,
  ): ReadableStream<TRead> {
    return this.syphon(new Filter<TRead>(transform, options));
  }
  bufferTransform<TOutput>(
    transform: (input: TRead[]) => TOutput | PromiseLike<TOutput>,
  ): ReadableStream<TOutput>;
  bufferTransform<TOutput>(
    transform: (input: Buffer) => TOutput | PromiseLike<TOutput>,
    encoding: 'buffer',
  ): ReadableStream<TOutput>;
  bufferTransform<TOutput>(
    transform: (input: string) => TOutput | PromiseLike<TOutput>,
    encoding: 'utf8',
  ): ReadableStream<TOutput>;
  bufferTransform<TOutput>(
    transform: (input: any) => TOutput | PromiseLike<TOutput>,
    encoding?: 'buffer' | 'utf8',
  ): ReadableStream<TOutput> {
    return this.syphon(
      new BufferTransform<TRead, TOutput>(transform, encoding as any),
    );
  }
}

export class FlatMap<TWrite, TRead> extends Transform<TWrite, TRead> {
  private _ready: Promise<void>;
  private _nextError: null | Error;
  constructor(
    transform: (
      chunk: TWrite,
    ) => TRead[] | PromiseLike<TRead[]> | ReadableStream<TRead>,
    options: FlatMapOptions = {},
  ) {
    let available = options.parallel || 1;
    const opts = {
      ...options,
      readableObjectMode: options.readableObjectMode !== false,
      writableObjectMode: options.writableObjectMode !== false,
      transform: (
        chunk: TWrite,
        encoding: string,
        push: (chunk: TRead, encoding?: string) => boolean,
        callback: (err?: null | Error, chunk?: TRead) => void,
      ) => {
        available--;
        let called = false;
        if (available > 0) {
          callback();
          called = true;
        }
        const result = transform(chunk);
        this._ready = this._ready
          .then<TRead[] | ReadableStream<TRead>>(() => {
            return result;
          })
          .then(result => {
            if (isReadableStream(result)) {
              return result
                .syphon(
                  new Writable<TRead>({
                    objectMode: options.writableObjectMode !== false,
                    write: (chunk, encoding, cb) => {
                      this.push(chunk);
                      // ideally, we would do some back pressure stuff here
                      cb();
                    },
                  }),
                )
                .wait();
            } else {
              result.forEach(c => push(c));
            }
          })
          .then(
            () => {
              available++;
              if (!called) {
                const err = this._nextError;
                this._nextError = null;
                callback(err);
              }
            },
            err => {
              available++;
              if (called) {
                this._nextError = err;
              } else {
                callback(err);
              }
            },
          );
      },
      flush: (
        push: (chunk: TRead, encoding?: string) => boolean,
        callback: (err?: null | Error, chunk?: TRead) => void,
      ) => {
        this._ready.then(() => {
          const err = this._nextError;
          this._nextError = null;
          callback(err);
        }, callback);
      },
    };
    if (opts.readableObjectMode !== false) {
      opts.readableObjectMode = true;
    }
    if (opts.writableObjectMode !== false) {
      opts.writableObjectMode = true;
    }
    super(opts);
    this._ready = Promise.resolve(undefined);
    this._nextError = null;
  }
}

export class Map<TWrite, TRead> extends FlatMap<TWrite, TRead> {
  constructor(
    transform: (chunk: TWrite) => TRead | PromiseLike<TRead>,
    options: FlatMapOptions = {},
  ) {
    super((chunk: TWrite) => {
      const result = transform(chunk);
      if (isPromise(result)) {
        return Promise.resolve(result).then(result => [result]);
      } else {
        return [result];
      }
    }, options);
  }
}
export class Filter<T> extends FlatMap<T, T> {
  constructor(
    transform: (chunk: T) => boolean | PromiseLike<boolean>,
    options: FlatMapOptions = {},
  ) {
    super((chunk: T) => {
      const result = transform(chunk);
      if (isPromise(result)) {
        return Promise.resolve(result).then(result => (result ? [chunk] : []));
      } else {
        return result ? [chunk] : [];
      }
    }, options);
  }
}

export class BufferTransform<
  TInput = Buffer | string,
  TOutput = Buffer | string
> extends Transform<TInput, TOutput> {
  private _buffer: TInput[] = [];
  constructor(transform: (input: TInput[]) => TOutput | PromiseLike<TOutput>);
  constructor(
    transform: (input: Buffer) => TOutput | PromiseLike<TOutput>,
    encoding: 'buffer',
  );
  constructor(
    transform: (input: string) => TOutput | PromiseLike<TOutput>,
    encoding: 'utf8',
  );
  constructor(
    transform: (input: any) => TOutput | PromiseLike<TOutput>,
    encoding?: 'buffer' | 'utf8',
  ) {
    super({
      readableObjectMode: !encoding,
      writableObjectMode: !encoding,
      transform: (chunk, encoding, push, callback) => {
        this._buffer.push(chunk);
        callback();
      },
      flush: (push, callback) => {
        let result;
        if (encoding === 'buffer') {
          result = transform(Buffer.concat(this._buffer.map(toBuffer)));
        } else if (encoding === 'utf8') {
          result = transform(
            Buffer.concat(this._buffer.map(toBuffer)).toString('utf8'),
          );
        } else {
          result = transform(this._buffer);
        }
        Promise.resolve(result)
          .then(data => {
            push(data);
            callback();
          })
          .catch(ex => {
            callback(ex);
          });
      },
    });
  }
}
