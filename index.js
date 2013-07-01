'use strict'

var concat = require('concat-stream')
var Promise = require('promise')

var old = !require('stream').Transform
var stream = old ? require('readable-stream') : require('stream')

module.exports = barrage
function barrage(s, prototype) {
  if (old && !prototype) {
    if (!(s instanceof stream.Readable || s instanceof stream.Writable)) {
      var os = s
      s = new stream.Readable({objectMode: true})
      s.wrap(os)
      if (typeof os.write === 'function') s.write = os.write.bind(os)
      if (typeof os.end === 'function') s.end = os.end.bind(os)
      os.on('drain', s.emit.bind(s, 'drain'))
      os.on('close', s.emit.bind(s, 'close'))
      os.on('pipe', s.emit.bind(s, 'pipe'))
    }
  }
  s.syphon = syphon
  s.wait = wait
  s.buffer = buffer
  return s
}
barrage.Readable = load('Readable')
barrage.Writable = load('Writable')
barrage.Duplex = load('Duplex')
barrage.Transform = load('Transform')
barrage.PassThrough = load('PassThrough')



function load(clsName) {
  var cls = stream[clsName]
  function Barrage() {
    return cls.apply(this, arguments)
  }
  Barrage.prototype = Object.create(cls.prototype)
  barrage(Barrage.prototype, true)
  return Barrage
}

/* Extensions */

function syphon(stream) {
  this.on('error', stream.emit.bind(stream, 'error'))
  return this.pipe(stream)
}

function wait(callback) {
  var self = this
  var p = new Promise(function (resolve, reject) {
    self.on('error', reject)
    self.on('finish', resolve)
    self.on('end', resolve)
    if (typeof self.resume === 'function') self.resume()
  })
  return p.nodeify(callback)
}

function buffer(callback) {
  var self = this
  var p = new Promise(function (resolve, reject) {
    self.on('error', reject)
    self.pipe(concat(resolve))
  })
  return p.nodeify(callback)
}