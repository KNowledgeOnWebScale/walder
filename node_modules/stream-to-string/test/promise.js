var test     = require('tape'),
    through2 = require('through2'),
    toString = require('..')

test('promise', function (t) {
    t.plan(2)

    var stream = through2()
    var p = toString(stream)
    t.ok(p.then, 'should be returned')
    p.then(function (str) {
        t.equal(str, 'this is a test', 'should resolve to expected value')
    })

    stream.write('this is a')
    stream.write(' test')
    stream.end()
})
