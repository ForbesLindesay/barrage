"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const streams = require("stream");
const isPromise = require("is-promise");
class Writable extends streams.Writable {
    constructor(options) {
        super(options);
    }
    write(...args) {
        return super.write(...args);
    }
    untyped() {
        return this;
    }
    wait() {
        return new Promise((resolve, reject) => {
            this.on('error', reject);
            this.on('end', resolve);
            this.on('finish', resolve);
            this.on('close', resolve);
        });
    }
    static fromStream(stream) {
        const s = stream;
        s.wait = Duplex.prototype.wait;
        s.untyped = Duplex.prototype.untyped;
        return s;
    }
}
exports.Writable = Writable;
function isReadableStream(stream) {
    return typeof stream.on === 'function' && typeof stream.syphon === 'function';
}
class Readable extends streams.Readable {
    constructor(options = {}) {
        super(Object.assign({}, options, { read: (size) => {
                if (options.read) {
                    return options.read.call(this, size, this._push);
                }
            } }));
        this._push = (chunk, encoding) => this.push(chunk, encoding);
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    pipe(destination, options) {
        return super.pipe(destination, options);
    }
    syphon(destination, options) {
        this.on('error', destination.emit.bind(destination, 'error'));
        return this.pipe(destination, options);
    }
    unpipe(destination) {
        return super.unpipe(destination);
    }
    push(chunk, encoding) {
        return super.push(chunk, encoding);
    }
    buffer(encoding) {
        const buffer = [];
        const destination = new Writable({
            objectMode: !encoding,
            write(chunk, encoding, callback) {
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
    flatMap(transform, options) {
        return this.syphon(new FlatMap(transform, options));
    }
    map(transform, options) {
        return this.syphon(new Map(transform, options));
    }
    filter(transform, options) {
        return this.syphon(new Filter(transform, options));
    }
    bufferTransform(transform, encoding) {
        return this.syphon(new BufferTransform(transform, encoding));
    }
    untyped() {
        return this;
    }
    static fromStream(stream) {
        const s = stream;
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
exports.Readable = Readable;
function toBuffer(value) {
    if (Buffer.isBuffer(value)) {
        return value;
    }
    return Buffer.from(value);
}
class PassThrough extends streams.PassThrough {
    write(...args) {
        return super.write(...args);
    }
    untyped() {
        return this;
    }
    wait() {
        return new Promise((resolve, reject) => {
            this.on('error', reject);
            this.on('end', resolve);
            this.on('finish', resolve);
            this.on('close', resolve);
        });
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    pipe(destination, options) {
        return super.pipe(destination, options);
    }
    syphon(destination, options) {
        this.on('error', destination.emit.bind(destination, 'error'));
        return this.pipe(destination, options);
    }
    unpipe(destination) {
        return super.unpipe(destination);
    }
    push(chunk, encoding) {
        return super.push(chunk, encoding);
    }
    buffer(encoding) {
        const buffer = [];
        const destination = new Writable({
            write(chunk, encoding, callback) {
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
    flatMap(transform, options) {
        return this.syphon(new FlatMap(transform, options));
    }
    map(transform, options) {
        return this.syphon(new Map(transform, options));
    }
    filter(transform, options) {
        return this.syphon(new Filter(transform, options));
    }
    bufferTransform(transform, encoding) {
        return this.syphon(new BufferTransform(transform, encoding));
    }
}
exports.PassThrough = PassThrough;
class Duplex extends streams.Duplex {
    constructor(options) {
        super(Object.assign({}, options, { read: (size) => {
                if (options.read) {
                    return options.read.call(this, size, this._push);
                }
            } }));
        this._push = (chunk, encoding) => this.push(chunk, encoding);
    }
    write(...args) {
        return super.write(...args);
    }
    untyped() {
        return this;
    }
    wait() {
        return new Promise((resolve, reject) => {
            this.on('error', reject);
            this.on('end', resolve);
            this.on('finish', resolve);
            this.on('close', resolve);
        });
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    pipe(destination, options) {
        return super.pipe(destination, options);
    }
    syphon(destination, options) {
        this.on('error', destination.emit.bind(destination, 'error'));
        return this.pipe(destination, options);
    }
    unpipe(destination) {
        return super.unpipe(destination);
    }
    push(chunk, encoding) {
        return super.push(chunk, encoding);
    }
    buffer(encoding) {
        const buffer = [];
        const destination = new Writable({
            write(chunk, encoding, callback) {
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
    flatMap(transform, options) {
        return this.syphon(new FlatMap(transform, options));
    }
    map(transform, options) {
        return this.syphon(new Map(transform, options));
    }
    filter(transform, options) {
        return this.syphon(new Filter(transform, options));
    }
    bufferTransform(transform, encoding) {
        return this.syphon(new BufferTransform(transform, encoding));
    }
    static fromStream(stream) {
        const s = stream;
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
exports.Duplex = Duplex;
class Transform extends streams.Transform {
    constructor(options) {
        super(Object.assign({}, options, { transform: (chunk, encoding, callback) => {
                return options.transform.call(this, chunk, encoding, this._push, callback);
            }, flush: (callback) => {
                if (options.flush) {
                    return options.flush.call(this, this._push, callback);
                }
                else {
                    callback();
                }
            } }));
        this._push = (chunk, encoding) => this.push(chunk, encoding);
    }
    write(...args) {
        return super.write(...args);
    }
    untyped() {
        return this;
    }
    wait() {
        return new Promise((resolve, reject) => {
            this.on('error', reject);
            this.on('end', resolve);
            this.on('finish', resolve);
            this.on('close', resolve);
        });
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    pipe(destination, options) {
        return super.pipe(destination, options);
    }
    syphon(destination, options) {
        this.on('error', destination.emit.bind(destination, 'error'));
        return this.pipe(destination, options);
    }
    unpipe(destination) {
        return super.unpipe(destination);
    }
    push(chunk, encoding) {
        return super.push(chunk, encoding);
    }
    buffer(encoding) {
        const buffer = [];
        const destination = new Writable({
            write(chunk, encoding, callback) {
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
    flatMap(transform, options) {
        return this.syphon(new FlatMap(transform, options));
    }
    map(transform, options) {
        return this.syphon(new Map(transform, options));
    }
    filter(transform, options) {
        return this.syphon(new Filter(transform, options));
    }
    bufferTransform(transform, encoding) {
        return this.syphon(new BufferTransform(transform, encoding));
    }
}
exports.Transform = Transform;
class FlatMap extends Transform {
    constructor(transform, options = {}) {
        let available = options.parallel || 1;
        const opts = Object.assign({}, options, { readableObjectMode: options.readableObjectMode !== false, writableObjectMode: options.writableObjectMode !== false, transform: (chunk, encoding, push, callback) => {
                available--;
                let called = false;
                if (available > 0) {
                    callback();
                    called = true;
                }
                const result = transform(chunk);
                this._ready = this._ready.then(() => {
                    return result;
                }).then(result => {
                    if (isReadableStream(result)) {
                        return result.syphon(new Writable({
                            objectMode: options.writableObjectMode !== false,
                            write: (chunk, encoding, cb) => {
                                this.push(chunk);
                                // ideally, we would do some back pressure stuff here
                                cb();
                            },
                        })).wait();
                    }
                    else {
                        result.forEach(c => push(c));
                    }
                }).then(() => {
                    available++;
                    if (!called) {
                        const err = this._nextError;
                        this._nextError = null;
                        callback(err);
                    }
                }, err => {
                    available++;
                    if (called) {
                        this._nextError = err;
                    }
                    else {
                        callback(err);
                    }
                });
            }, flush: (push, callback) => {
                this._ready.then(() => {
                    const err = this._nextError;
                    this._nextError = null;
                    callback(err);
                }, callback);
            } });
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
exports.FlatMap = FlatMap;
class Map extends FlatMap {
    constructor(transform, options = {}) {
        super((chunk) => {
            const result = transform(chunk);
            if (isPromise(result)) {
                return Promise.resolve(result).then(result => [result]);
            }
            else {
                return [result];
            }
        }, options);
    }
}
exports.Map = Map;
class Filter extends FlatMap {
    constructor(transform, options = {}) {
        super((chunk) => {
            const result = transform(chunk);
            if (isPromise(result)) {
                return Promise.resolve(result).then(result => (result ? [chunk] : []));
            }
            else {
                return result ? [chunk] : [];
            }
        }, options);
    }
}
exports.Filter = Filter;
class BufferTransform extends Transform {
    constructor(transform, encoding) {
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
                }
                else if (encoding === 'utf8') {
                    result = transform(Buffer.concat(this._buffer.map(toBuffer)).toString('utf8'));
                }
                else {
                    result = transform(this._buffer);
                }
                Promise.resolve(result).then(data => {
                    push(data);
                    callback();
                }).catch(ex => {
                    callback(ex);
                });
            },
        });
        this._buffer = [];
    }
}
exports.BufferTransform = BufferTransform;
