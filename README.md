# barrage

NodeJS Streams with strong types via typescript, and helper methods to make dealing with object streams pleasent.

[![Build Status](https://img.shields.io/travis/ForbesLindesay/barrage/master.svg)](https://travis-ci.org/ForbesLindesay/barrage)
[![Dependency Status](https://img.shields.io/david/ForbesLindesay/barrage.svg)](https://david-dm.org/ForbesLindesay/barrage)
[![NPM version](https://img.shields.io/npm/v/barrage.svg)](https://www.npmjs.com/package/barrage)

## Installation

    npm install barrage

## API

```js
import {Readable, Writable, Transform} from 'barrage';
```

These are native streams, but with a few extensions:

### readable.syphon(stream, [options])

This is exactly like the built in `source.pipe(destination, [options])` except that it also forwards any errors emitted by `source` to the `destination`.  When your streams represent transformations, that is usually much more useful than the built in `.pipe`.

### readable.buffer([encoding]): Promise

When the barrage is a readable stream, this method buffers the results and handles errors, resulting in a node.js style `callback` API.  If there is no `encoding` parameter, the callback is called with an `Array` for the result.  If encoding is `'buffer'` then the callback is called with a single `Buffer` for the result.  If any other string is passed as `encoding`, the `encoding` parameter is passed on to `buffer.toString(encoding)` and the result is therefore a `String`

### writable.wait(): Promise

This works like `barrage.buffer`, except that it does not buffer the result.  It will wait for an `end` or `finish` event and then call the callback.  If an error event is fired, the callback is called with that error. The callback is only ever called once.

If the callback parameter is absent, a [Promises/A+](http://promises-aplus.github.io/promises-spec/) promise is returned instead.

### readable.map(transform, options) / new barrage.Map(transform, options)

This passes each chunk to `transform` and then pushes the result of calling `transform` to the output stream.  You can either call this as a method on an existing barrage stream, or create a `Transform` stream by calling `new barrage.Map`

e.g.

```js
function square() {
  return new barrage.Map(function (x) {
    return x * x
  })
}
```

It supports both being asynchronous, and parallel:

```js
function load() {
  return new barrage.Map(function (stat, callback) {
    fs.readFile(stat.fullPath, callback)
  }, {parallel: 10})
}
```

When operating in parallel, the ordering of the resulting stream is always preserved.

It also supports promises

```js
function load() {
  return new barrage.Map(function (stat) {
    return Promise.denodeify(fs.readFile)(stat.fullPath)
  }, {parallel: 10})
}
```

### readable.filter(transform, options) / new barrage.Filter(transform, options)

This is exactly like `barrage.map` / `new barrage.Map` except that `transform` should return `true` or `false` and the chunks will be filtered based on that value.

### readable.flatMap(transform, options) / new barrage.FlatMap(transform, options)

Take a function that maps an object onto an array or stream (or if `for...of` is supported by your version of node, any iterable), then return a stream for those individual items.  e.g.

```js
var source = new b.Readable({objectMode: true});
source._read = function () {
  this.push(1)
  this.push(2)
  this.push(3)
  this.push(null)
};
source.flatMap(function (x) {
  var source = new b.Readable({objectMode: true})
  source._read = function () {
    this.push(x * 1) // 1, 2, 3
    this.push(x * 2) // 2, 4, 6
    this.push(null)
  }
  return source
}).buffer().done(function (data) {
    assert.deepEqual(data, [1, 2, 2, 4, 3, 6])
    done()
  })
  ```

### readable.bufferTransform(transform, encoding) / new barrage.BufferTransform(transform, encoding)

Takes a function that transforms a string and returns a `Transform` stream.  e.g.

```js
function coffeify(filename) {
  return new barrage.BufferTransform(function (src) {
    return compileCoffee(filename, src)
  }, 'utf8')
}
function compileCoffee(filename, src) {
  //do compilation and return a string
}
fs.createReadStream('src.coffee').pipe(coffeify('src.coffee')).pipe(fs.createWriteStream('src.js'))
```

This is mostly useful for processing files over stdio and creating browserify transforms.

The `transform` function may optionally take a callback argument (if it returns `undefined`) or return a promise (instead of a string).

## License

  MIT
