[![Build Status](https://travis-ci.org/chrisallenlane/streamify-string.svg)](https://travis-ci.org/chrisallenlane/streamify-string)
[![npm](https://img.shields.io/npm/v/streamify-string.svg)]()
[![npm](https://img.shields.io/npm/dt/streamify-string.svg)]()

streamify-string
================
`streamify-string` accepts a `string` and returns a [Readable stream][] that
outputs the string. It's useful for stubbing Readable streams when writing
unit-tests for [Writeable][], [Duplex][], and [Transform][] streams.

```javascript
const Streamify        = require('streamify-string');
const myWritableStream = require('../path/to/file.js');

// initialize a string
var str = 'Grumpy wizards make toxic brew for the evil Queen and Jack.'

// "Streamify" that string and pipe it to a writeable stream
Streamify(str).pipe(myWriteableStream);
```

### Parameters ###
```javascript
const streamified = Streamify(str, [options]);
```
- `str`: the `string` that the stream should output.
- `options`: Optional options to pass to the stream constructor. ([Documentation][options])

### Events ###
The stream will emit the following events:

- [`readable`][event-readable]
- [`data`][event-data]
- [`end`][event-end]
- [`close`][event-close]


[Duplex]: https://nodejs.org/api/stream.html#stream_class_stream_duplex
[Readable stream]: https://nodejs.org/api/stream.html#stream_class_stream_readable
[Transform]: https://nodejs.org/api/stream.html#stream_class_stream_transform
[Writeable]: https://nodejs.org/api/stream.html#stream_class_stream_writable

[event-close]: https://nodejs.org/api/stream.html#stream_event_close_1
[event-data]: https://nodejs.org/api/stream.html#stream_event_data
[event-end]: https://nodejs.org/api/stream.html#stream_event_end
[event-readable]: https://nodejs.org/api/stream.html#stream_event_readable
[options]: https://nodejs.org/api/stream.html#stream_new_stream_readable_options
