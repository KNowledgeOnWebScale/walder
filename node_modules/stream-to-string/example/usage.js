var toString = require('..'),
    through2 = require('through2'),
    stream   = through2()

toString(stream, function (err, msg) {
    console.log(msg)
})

stream.write('this is a')
stream.write(' test')
stream.end()
