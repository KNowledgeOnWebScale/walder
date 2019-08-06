var test     = require('tape'),
    through2 = require('through2'),
    toString = require('..')

test('value', function (t) {
    t.plan(1)

    var stream = through2()
    toString(stream, function (err, str) {
        t.equal(str, 'this is a test', 'should match expected value')
    })

    stream.write('this is a')
    stream.write(' test')
    stream.end()
})
