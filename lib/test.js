'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const b = require("./");
var assert = require('assert');
var s = require('stream');
var Promise = require('promise');
function delay(n) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), n);
    });
}
// describe('barrage(stream) mixin', function () {
//   it('returns `stream` with a mixin', function () {
//     var r = new s.Readable()
//     var w = new s.Writable()
//     var t = new s.Transform()
//     assert(b(r) === r)
//     assert(b(w) === w)
//     assert(b(t) === t)
//   })
// })
function streamType(name, type) {
    describe('barrage.' + name, function () {
        it('is inherits from stream.' + name, function () {
            assert(b[name].prototype.__proto__.constructor === s[name]);
        });
    });
}
streamType('Readable', 'readable');
streamType('Writable', 'writable');
streamType('Duplex', 'readable');
streamType('Transform', 'readable');
streamType('PassThrough', 'readable');
describe('barrage extensions', function () {
    describe('BarrageStream#syphon', function () {
        it('pipes data', function (done) {
            var source = new b.Readable({
                read() {
                    this.push('foo');
                    this.push('bar');
                    this.push(null);
                },
            });
            var dest = new b.PassThrough();
            source.syphon(dest);
            var data = [];
            dest
                .on('error', done)
                .on('data', function (chunk) {
                data.push(chunk);
            })
                .on('end', function () {
                assert.equal('foobar', data.join(''));
                done();
            });
        });
        it('pipes errors', function (done) {
            var singleton = {};
            var source = new b.Readable({
                read() { }
            });
            var dest = new b.PassThrough();
            source.syphon(dest);
            dest.on('error', function (err) {
                assert.equal(singleton, err);
                done();
            });
            source.emit('error', singleton);
        });
    });
    describe('BarrageStream#wait', function () {
        it('waits for `finish` or `end` events and catches `error` events', function (done) {
            var source = new b.Writable({ write(chunk, encoding, cb) {
                    cb();
                } });
            source.write('foo');
            source.write('bar');
            source.end();
            source.wait().then(() => {
                var sourceB = new b.Writable({ write(chunk, encoding, cb) {
                        cb();
                    } });
                var singleton = {};
                sourceB.wait().catch((err) => {
                    assert.equal(singleton, err);
                    done();
                });
                sourceB.emit('error', singleton);
            }).catch(done);
        });
    });
    describe('BarrageStream#buffer', function () {
        it('buffers the content of a Readable stream and catches `error` events', function (done) {
            const source = new b.Readable({
                objectMode: true,
                read() {
                    this.push('foo');
                    this.push('bar');
                    this.push(null);
                },
            });
            source.buffer().then(data => {
                assert.deepEqual(['foo', 'bar'], data);
                const sourceB = new b.Readable({
                    objectMode: false,
                    read() {
                        this.push('foo');
                        this.push('bar');
                        this.push(null);
                    },
                });
                return sourceB.buffer('buffer');
            }).then(data => {
                assert(Buffer.isBuffer(data));
                assert.equal('foobar', data.toString());
                const sourceC = new b.Readable({
                    objectMode: false,
                    read() {
                        this.push('foo');
                        this.push('bar');
                        this.push(null);
                    },
                });
                return sourceC.buffer('utf8');
            }).then(data => {
                assert(typeof data === 'string');
                assert.equal('foobar', data);
                const sourceD = new b.Readable();
                const singleton = {};
                sourceD.buffer().catch((err) => {
                    assert.equal(singleton, err);
                    done();
                });
                sourceD.emit('error', singleton);
            }).catch(done);
        });
    });
    describe('BarrageStream#map', function () {
        it('maps each element onto a new element', function (done) {
            const source = new b.Readable({
                objectMode: true,
                read() {
                    this.push(1);
                    this.push(2);
                    this.push(3);
                    this.push(null);
                },
            });
            const data = [];
            source.map((x) => x * x)
                .on('error', done)
                .on('data', function (chunk) {
                data.push(chunk);
            })
                .on('end', function () {
                assert.deepEqual(data, [1, 4, 9]);
                done();
            });
        });
        it('can be used asynchronously', function (done) {
            const source = new b.Readable({
                objectMode: true,
                read() {
                    this.push(1);
                    this.push(2);
                    this.push(3);
                    this.push(null);
                },
            });
            const data = [];
            source.map(x => Promise.resolve(x * x))
                .on('error', done)
                .on('data', function (chunk) {
                data.push(chunk);
            })
                .on('end', function () {
                assert.deepEqual(data, [1, 4, 9]);
                done();
            });
        });
        it('can be used in parallel', function (done) {
            var source = new b.Readable({ objectMode: true, read() {
                    this.push(1);
                    this.push(2);
                    this.push(3);
                    this.push(null);
                } });
            const data = [];
            let running = 0;
            source.map(async (x) => {
                running++;
                if (x === 1) {
                    await delay(100);
                }
                if (x === 2) {
                    assert(running === 2);
                    await delay(50);
                }
                if (x === 3) {
                    assert(running <= 2);
                    await delay(0);
                }
                running--;
                return x * x;
            }, { parallel: 2 })
                .on('error', done)
                .on('data', function (chunk) {
                data.push(chunk);
            })
                .on('end', function () {
                assert.deepEqual(data, [1, 4, 9]);
                done();
            });
        });
    });
    describe('BarrageStream#filter', function () {
        it('filters each element', function (done) {
            const source = new b.Readable({
                objectMode: true,
                read() {
                    this.push(1);
                    this.push(2);
                    this.push(3);
                    this.push(null);
                },
            });
            const data = [];
            source.filter(function (x) { return x > 1; })
                .on('error', done)
                .on('data', function (chunk) {
                data.push(chunk);
            })
                .on('end', function () {
                assert.deepEqual(data, [2, 3]);
                done();
            });
        });
        it('can be used asynchronously', function (done) {
            const source = new b.Readable({ objectMode: true, read() {
                    this.push(1);
                    this.push(2);
                    this.push(3);
                    this.push(null);
                } });
            const data = [];
            source.filter(x => Promise.resolve(x > 1))
                .on('error', done)
                .on('data', function (chunk) {
                data.push(chunk);
            })
                .on('end', function () {
                assert.deepEqual(data, [2, 3]);
                done();
            });
        });
        it('can be used in parallel', function (done) {
            var source = new b.Readable({ objectMode: true, read() {
                    this.push(1);
                    this.push(2);
                    this.push(3);
                    this.push(null);
                } });
            const data = [];
            let running = 0;
            source.filter(async (x) => {
                running++;
                if (x === 1) {
                    await delay(100);
                }
                if (x === 2) {
                    assert(running === 2);
                    await delay(50);
                }
                if (x === 3) {
                    assert(running <= 2);
                    await delay(0);
                }
                running--;
                return x > 1;
            }, { parallel: 2 })
                .on('error', done)
                .on('data', function (chunk) {
                data.push(chunk);
            })
                .on('end', function () {
                assert.deepEqual(data, [2, 3]);
                done();
            });
        });
    });
    describe('BarrageStream#bufferTransform', function () {
        it('transforms as a buffer', function (done) {
            const source = new b.Readable({ objectMode: true, read() {
                    this.push(1);
                    this.push(2);
                    this.push(3);
                    this.push(null);
                } });
            const data = [];
            source.bufferTransform(x => x.reverse())
                .on('error', done)
                .on('data', function (chunk) {
                data.push(chunk);
            })
                .on('end', function () {
                assert.deepEqual(data, [[3, 2, 1]]);
                done();
            });
        });
        it('supports an encoding option', function (done) {
            var source = new b.Readable({ objectMode: true,
                read() {
                    this.push('h');
                    this.push('e');
                    this.push('l');
                    this.push('l');
                    this.push('o');
                    this.push(null);
                }
            });
            var data = [];
            source.bufferTransform(x => x + ' world', 'utf8')
                .on('error', done)
                .on('data', (chunk) => {
                data.push(chunk.toString());
            })
                .on('end', function () {
                assert.deepEqual(data, ['hello world']);
                done();
            });
        });
    });
    describe('BarrageStream#flatMap(val->stream)', function () {
        it('transforms as a stream', function (done) {
            var source = new b.Readable({ objectMode: true, read() {
                    this.push(1);
                    this.push(2);
                    this.push(3);
                    this.push(null);
                } });
            const data = [];
            source.flatMap((x) => {
                var source = new b.Readable({ objectMode: true, read() {
                        this.push(x * 1);
                        this.push(x * 2);
                        this.push(null);
                    } });
                return source;
            })
                .on('error', done)
                .on('data', function (chunk) {
                data.push(chunk);
            })
                .on('end', function () {
                assert.deepEqual(data, [1, 2, 2, 4, 3, 6]);
                done();
            });
        });
    });
});
