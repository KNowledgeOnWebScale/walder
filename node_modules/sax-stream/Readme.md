[![Build Status](https://img.shields.io/travis/melitele/sax-stream.svg)](http://travis-ci.org/melitele/sax-stream)
[![Dependency Status](https://img.shields.io/gemnasium/code42day/sax-stream.svg)](https://gemnasium.com/code42day/sax-stream)
[![NPM version](https://img.shields.io/npm/v/sax-stream.svg)](https://www.npmjs.org/package/sax-stream)

# sax-stream

[Transform stream][transform-stream] for parsing large XML files. It is using SAX module internally. Emits objects:
one object per each selected node.

## Installation

	  $ npm install sax-stream


## Usage

Use as any transform stream: pipe request or file stream to it, pipe it downstream to another
transform/writeable stream or handle `data` event.

```javascript
var saxStream = require('sax-stream');


request('http://blog.npmjs.org/rss')
  .pipe(saxStream({
  	strict: true,
    tag: 'item'
  })
  .on('data', function(item) {
    console.log(item);
  });

```

## API

Create passing options object:

- `tag` - name of the tag to select objects from XML file, an Array of tag names can be used - when multiple tags are specified stream pushes `{ tag, record }` tuples
- `highWaterMark` - size of internal transform stream buffer - defaults to 350 objects
- `strict` - default to false, if `true` makes sax parser to accept valid XML only
- `trim`, `normalize`, `lowercase`, `xmlns`, `position`, `strictEntities`, `noscript` - passed to [sax] parser

# License

MIT

[transform-stream]: http://nodejs.org/api/stream.html#stream_class_stream_transform
[sax]: https://github.com/isaacs/sax-js#arguments
