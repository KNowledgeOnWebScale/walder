# Async Union Iterator

[![Build Status](https://travis-ci.org/rubensworks/asynciterator-union.js.svg?branch=master)](https://travis-ci.org/rubensworks/asynciterator-union.js)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/asynciterator-union.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/asynciterator-union.js?branch=master)
[![npm version](https://badge.fury.io/js/asynciterator-union.svg)](https://www.npmjs.com/package/asynciterator-union) [![Greenkeeper badge](https://badges.greenkeeper.io/rubensworks/asynciterator-union.js.svg)](https://greenkeeper.io/)

An AsyncIterator for taking the union of different AsyncIterators.

As of version 1.2.0, this requires Node version 8 or higher.

## Usage

```javascript
const RoundRobinUnionIterator = require('asynciterator-union').RoundRobinUnionIterator;

let it = new RoundRobinUnionIterator([AsyncIterator.range(0, 2), AsyncIterator.range(2, 4)]);
it.on('data', console.log);
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
