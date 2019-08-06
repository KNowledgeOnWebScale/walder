const Streamify = require('../index.js');
const split     = require('split');
const test      = require('tape');

/**
 * NB: In the following tests, `split` is being used as a placeholder for any
 * writeable stream. I'm just using it to drain the "Streamified" stream, such
 * as to cause `end` and `close` events to be emitted.
 */

// a test string
const str = [
  'foo',
  'bar',
  'baz',
].join('\n');

// tests
test('Flowing mode: should emit `data` events', function(t) {
  t.plan(3);

  var counter = 0;

  Streamify(str)
    .pipe(split())
    .on('data', function(chunk) {
      counter++;
      t.pass('`data` emitted. (' + counter + ')');
  });
});

test('Flowing mode: should emit a `readable` event', function(t) {
  t.plan(1);

  Streamify(str)
    .on('readable', function() {
      t.pass('`readable` emitted.');
  });
});

test('Flowing mode: should emit an `end` event', function(t) {
  t.plan(1);

  Streamify(str)
    .pipe(split())
    .on('end', function() {
      t.pass('`end` emitted');
    });
});

test('Flowing mode: should emit an `close` event', function(t) {
  t.plan(1);

  Streamify(str)
    .pipe(split())
    .on('close', function() {
      t.pass('`close` emitted');
    });
});

test('Flowing mode: should be pipeable', function(t) {
  t.plan(1);

  Streamify(str)
    .pipe(split())
    .on('end', function() {
      t.pass('Successfully piped.');
  });
});

test('Flowing mode: should not mangle data', function(t) {
  t.plan(3);

  var counter  = -1;
  var expected = [ 'foo', 'bar', 'baz' ];

  Streamify(str)
    .pipe(split())
    .on('data', function(chunk) {
      t.equals(chunk.toString(), expected[++counter]);
  });
});

test('Paused mode: should be readable', function(t) {
  t.plan(1);

  const streamified = Streamify(str);

  streamified.once('readable', function() {
    streamified.pause();

    var chunk;
    var bytes = new Buffer(0);

    while (null !== (chunk = streamified.read())) {
      bytes = Buffer.concat([bytes, chunk]);
    }

    t.equals(bytes.toString(), str);
  });

});
