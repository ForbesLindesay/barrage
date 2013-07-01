'use strict'

var assert = require('assert')
var s = require('stream').Transform ? require('stream') : require('readable-stream')
var b = require('../')

function streamType(name, type) {
  describe('barrage.' + name, function () {
    var i = new b[name]()
    it('is an instance of stream.' + name, function () {
      assert(i instanceof s[name])
    })
    it('is a ' + type + ' barrage', function () {
      if (type === 'readable' || type === 'writable') {
        assert(typeof i.syphon === 'function')
        assert(typeof i.buffer === 'function')
        assert(typeof i.wait === 'function')
      } else {
        throw new Error('unrecognized type')
      }
    })
  })
}
streamType('Readable', 'readable')
streamType('Writable', 'writable')
streamType('Duplex', 'readable')
streamType('Transform', 'readable')
streamType('PassThrough', 'readable')

var old = !require('stream').Transform

describe('barrage(stream) mixin', function () {
  if (old) {
    describe('in v0.8 and earlier', function () {
      it('wraps the read side of the stream using `readable-stream`', function (done) {
        var r = new (require('stream'))()
        var wrapped = b(r)
        assert(wrapped instanceof s.Readable)
        wrapped.emit('data', 'foo')
        setTimeout(function () {
          wrapped.buffer(function (err, data) {
            if (err) done(err)
            assert.equal('foobar', data.toString())
          })
        }, 100)
        wrapped.emit('data', 'bar')
      })
    })
  } else {
    describe('in v0.10 and later', function () {
      it('returns `stream` as a mixin', function () {
        var r = new s.Readable()
        var w = new s.Writable()
        var t = new s.Transform()
        assert(b(r) === r)
        assert(b(w) === w)
        assert(b(t) === t)
      })
    })
  }
})