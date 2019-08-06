# Async Promise Proxy Iterator

[![Build Status](https://travis-ci.org/rubensworks/asynciterator-promiseproxy.js.svg?branch=master)](https://travis-ci.org/rubensworks/asynciterator-promiseproxy.js)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/asynciterator-promiseproxy.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/asynciterator-promiseproxy.js?branch=master)
[![npm version](https://badge.fury.io/js/asynciterator-promiseproxy.svg)](https://www.npmjs.com/package/asynciterator-promiseproxy)

An AsyncIterator proxy that allows its source to be set via a promise.

This is useful in cases when you need to pass an iterator,
but only know its source at a later stage,
or if you want to create this source lazilly.

## Usage

```javascript
const PromiseProxyIterator = require('asynciterator-promiseproxy').PromiseProxyIterator;

let it = new PromiseProxyIterator(() -> makeIterator());
it.on('data', console.log);

async function makeIterator() {
  someExpensiveOperation();
  return AsyncIterator.range(0, 10); 
}
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
