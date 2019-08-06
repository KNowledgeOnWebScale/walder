var Promise = require('promise-polyfill')

module.exports = function (stream, enc, cb) {
    if (typeof enc === 'function') {
        cb = enc
        enc = null
    }
    cb = cb || function () {}

    var str = ''

    return new Promise (function (resolve, reject) {
        stream.on('data', function (data) {
            str += (typeof enc === 'string') ? data.toString(enc) : data.toString()
        })
        stream.on('end', function () {
            resolve(str)
            cb(null, str)
        })
        stream.on('error', function (err) {
            reject(err)
            cb(err)
        })
    })
}
