# Asynchronous iterators for JavaScript
[![Build Status](https://travis-ci.org/RubenVerborgh/AsyncIterator.svg?branch=master)](https://travis-ci.org/RubenVerborgh/AsyncIterator)
[![Coverage Status](https://coveralls.io/repos/github/RubenVerborgh/AsyncIterator/badge.svg)](https://coveralls.io/github/RubenVerborgh/AsyncIterator)
[![npm version](https://badge.fury.io/js/asynciterator.svg)](https://www.npmjs.com/package/asynciterator)

**AsyncIterator is a lightweight JavaScript implementation of demand-driven object streams,**
and an alternative to the two-way flow controlled [Node.js `Stream`](https://nodejs.org/api/stream.html).
As opposed to `Stream`, you cannot _push_ anything into an `AsyncIterator`;
instead, an iterator _pulls_ things from another iterator.
This eliminates the need for expensive, complex flow control.

[Read the full API documentation.](http://rubenverborgh.github.io/AsyncIterator/docs/)

## Data streams that only generate what you need
`AsyncIterator` allows functions to
**return multiple _asynchronously_ and _lazily_ created values**.
This adds a missing piece to JavaScript,
which natively supports returning a single value synchronously
and asynchronously (through [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)),
but multiple values only synchronously (through [`Iterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)):

<table>
  <tr>
    <td>&nbsp;</td>
    <th>single value</th>
    <th>multiple values</th>
  </tr>
  <tr>
    <th>synchronous</th>
    <td><code>T getValue()</code></td>
    <td><code>Iterable&lt;T&gt; getValues()</code></td>
  </tr>
  <tr>
    <th>asynchronous</th>
    <td><code>Promise&lt;T&gt; getValue()</code></td>
    <td><strong><code>AsyncIterator&lt;T&gt; getValues()</code></strong></td>
  </tr>
</table>

Like `Iterable`, **an `AsyncIterator` only generates items when you ask it to**.
This contrast with patterns such as [`Observable`](http://reactivex.io/intro.html),
which are data-driven and don't wait for consumers to process items.

### The asynchronous iterator interface
An asynchronous iterator is an object that exposes a series of data items by:
- implementing [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter)
- returning an item when you call `iterator.read` (yielding `null` when none is available at the moment)
- informing when new items might be available through `iterator.on('readable', callback)`
- informing when no more items will become available through `iterator.on('end', callback)`
- streaming all of its items when you register through `iterator.on('data', callback)`

Any object that conforms to the above conditions can be used with the AsyncIterator library
(this includes [Node.js Streams](https://nodejs.org/api/stream.html)).
The `AsyncIterator` interface additionally exposes
[several other methods and properties](http://rubenverborgh.github.io/AsyncIterator/docs/AsyncIterator.html).

## Example: fetching Wikipedia links related to natural numbers
In the example below, we create an iterator of links found on Wikipedia pages for natural numbers.
```JavaScript
var AsyncIterator = require('asynciterator');

// Iterate over the natural numbers
var numbers = new AsyncIterator.IntegerIterator({ start: 0, end: Infinity });
// Transform these numbers into Wikipedia URLs
var urls = numbers.map(function (number) {
  return 'https://en.wikipedia.org/wiki/' + number;
});
// Fetch each corresponding Wikipedia page
var pages = urls.transform(function (url, done) {
  require('https').get(url, function (response) {
    var page = '';
    response.on('data', function (data) { page += data; });
    response.on('end',  function () { pages._push(page); done(); });
  });
});
// Extract the links from each page
var links = pages.transform(function (page, done) {
  var search = /href="([^"]+)"/g, match, resolve = require('url').resolve;
  while (match = search.exec(page))
    this._push(resolve('https://en.wikipedia.org/', match[1]));
  done();
});
```

We could display a link every 0.1 seconds:
```JavaScript
setInterval(function () {
  var link = links.read();
  if (link) console.log(link);
}, 100);
```

Or we can get the first 30 links and display them:
```JavaScript
links.take(30).on('data', console.log);
```

In both cases, pages from Wikipedia will only be fetched when needed—the data consumer is in control.
This is what makes `AsyncIterator` [lazy](https://en.wikipedia.org/wiki/Lazy_evaluation).

If we had implemented this using the `Observable` pattern,
an entire flow of unnecessary pages would be fetched,
because it is controlled by the data publisher instead.

## Usage
`AsyncIterator` implements the [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter) interface
and a superset of the [`Stream`](https://nodejs.org/api/stream.html) interface.

### Consuming an AsyncIterator in on-demand mode
By default, an AsyncIterator is in _on-demand_ mode,
meaning it only generates items when asked to.

The [`read` method](http://rubenverborgh.github.io/AsyncIterator/docs/AsyncIterator.html#read) returns the next item,
or `null` when no item is available.

```JavaScript
var numbers = new AsyncIterator.IntegerIterator({ start: 1, end: 2 });
console.log(numbers.read()); // 1
console.log(numbers.read()); // 2
console.log(numbers.read()); // null
```

If you receive `null`,
you should wait until the next [`readable` event](http://rubenverborgh.github.io/AsyncIterator/docs/AsyncIterator.html#.event:readable) before reading again.
This event is not a guarantee that an item _will_ be available.

```JavaScript
links.on('readable', function () {
  var link;
  while (link = links.read())
    console.log(link);
});
```

The [`end` event](http://rubenverborgh.github.io/AsyncIterator/docs/AsyncIterator.html#.event:end) is emitted after you have read the last item from the iterator.

### Consuming an AsyncIterator in flow mode
An AsyncIterator can be switched to _flow_ mode by listening to the [`data` event](http://rubenverborgh.github.io/AsyncIterator/docs/AsyncIterator.html#.event:data).
In flow mode, iterators generate items as fast as possible.

```JavaScript
var numbers = new AsyncIterator.IntegerIterator({ start: 1, end: 100 });
numbers.on('data', function (number) { console.log('number', number); });
numbers.on('end',  function () { console.log('all done!'); });
```

To switch back to on-demand mode, simply remove all `data` listeners.

### Setting and reading properties
An AsyncIterator can have custom properties assigned to it,
which are preserved when the iterator is cloned.
This is useful to pass around metadata about the iterator.

```JavaScript
var numbers = new AsyncIterator.IntegerIterator();
numbers.setProperty('rate', 1234);
console.log(numbers.getProperty('rate')); // 1234

var clone = numbers.clone();
console.log(clone.getProperty('rate'));   // 1234

numbers.setProperty('rate', 4567);
console.log(clone.getProperty('rate'));   // 4567
```

You can also attach a callback
that will be called as soon as the property is set:

```JavaScript
var numbers = new AsyncIterator.IntegerIterator();
numbers.getProperty('later', console.log);
numbers.setProperty('later', 'value');
// 'value'
```

## License
The asynciterator library is copyrighted by [Ruben Verborgh](http://ruben.verborgh.org/)
and released under the [MIT License](http://opensource.org/licenses/MIT).
