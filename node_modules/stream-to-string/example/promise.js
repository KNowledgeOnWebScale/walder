var toString = require('..'),
    through2 = require('through2'),
    stream   = through2()

toString(stream).then(function (msg) {
    console.log(msg)
})

stream.write('this is a')
stream.write(' test')
stream.end()
