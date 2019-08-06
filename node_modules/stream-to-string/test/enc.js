var test     = require('tape'),
    through2 = require('through2'),
    toString = require('..')

test('enc', function (t) {
    t.plan(1)

    var stream = through2()
    toString(stream, 'hex', function (err, str) {
        t.equal(str, '68656c6c6f20776f726c64', 'should match expected value')
    })

    stream.end('hello world')
})
