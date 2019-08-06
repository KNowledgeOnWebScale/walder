# stream-to-string

[![NPM version](https://badge.fury.io/js/stream-to-string.png)](http://badge.fury.io/js/stream-to-string)
[![Build Status](https://travis-ci.org/jasonpincin/stream-to-string.svg?branch=master)](https://travis-ci.org/jasonpincin/stream-to-string)
[![Coverage Status](https://coveralls.io/repos/jasonpincin/stream-to-string/badge.png?branch=master)](https://coveralls.io/r/jasonpincin/stream-to-string?branch=master)

Pipe a stream into a string, collect value with callback or promise

## example

```javascript
var toString = require('..'),
    through2 = require('through2'),
    stream   = through2()

toString(stream, function (err, msg) {
    console.log(msg)
})

# or with promises
toString(stream).then(function (msg) {
    console.log(msg)
})

stream.write('this is a')
stream.write(' test')
stream.end()
```

## api

```javascript
var toString = require('stream-to-string')
```

### toString(stream[, enc][, cb])

Collects stream data into a string. Accepts an optional encoding argument used when converting the stream. Executes optional callback with `err, string`. Returns a promise.

## testing

`npm test [--dot | --spec] [--coverage | --grep=pattern]`

Specifying `--dot` or `--spec` will change the output from the default TAP style. 
Specifying `--coverage` will print a text coverage summary to the terminal after 
tests have ran, while `--pattern` will only run the test files that match the given 
pattern.

Open an html coverage report with `npm run view-cover`.
