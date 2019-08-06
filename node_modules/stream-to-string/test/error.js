var test     = require('tape'),
    through2 = require('through2'),
    toString = require('..')

test('error', function (t) {
    t.plan(1)

    var stream = through2()
    toString(stream, function (err, str) {
        t.true(err, 'cb executed with err on stream error')
    })

    stream.emit('error', 'boom')
})
