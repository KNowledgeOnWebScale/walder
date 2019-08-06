# AsyncReiterable

[![Build Status](https://travis-ci.org/rubensworks/asyncreiterable.js.svg?branch=master)](https://travis-ci.org/rubensworks/asyncreiterable.js)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/asyncreiterable.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/asyncreiterable.js?branch=master)
[![npm version](https://badge.fury.io/js/asyncreiterable.svg)](https://www.npmjs.com/package/asyncreiterable) [![Greenkeeper badge](https://badges.greenkeeper.io/rubensworks/asyncreiterable.js.svg)](https://greenkeeper.io/)

An `AsyncReiterable` is an append-only collection that allows _multiple asynchronous iterations_.

Each time the `iterator()` method of this `AsyncReiterable` is called,
a new [AsyncIterator](https://www.npmjs.com/package/asynciterator) is produced.

This package can be used in cases where you need an [AsyncIterator](https://www.npmjs.com/package/asynciterator),
but you need to be able to iterate over them _multiple times_.

## Install

```
$ npm install asyncreiterable
```

## Usage

At the time of writing, this package provides `AsyncReiterableArray`,
an array-backed implementation of the `AsyncReiterable` interface.

### Constructing

It can be constructed in different ways through the following static methods:
```javascript
import {AsyncReiterableArray} from "asyncreiterable";

# Creates an ended AsyncReiterable with the given data elements
AsyncReiterableArray.fromFixedData([1, 2, 3])

# Creates an open-ended AsyncReiterable with the given initial data elements
AsyncReiterableArray.fromInitialData([1, 2, 3])

# Creates an open-ended AsyncReiterable with no initial data elements
AsyncReiterableArray.fromInitialEmpty()
```

### Appending

Data elements can only be _pushed_,
no data elements can be removed.

The iterable becomes _ended_ when `null` is pushed.

```javascript
const iterable = AsyncReiterableArray.fromInitialData([1, 2, 3])

# Add data elements
iterable.push(4);
iterable.push(5);
iterable.push(6);

# End the iterable
iterable.push(null);
```

### Iterating

`AsyncReiterable` that are either ended or not ended yet can both be iterated.

The `iterator()` method returns an [AsyncIterator](https://www.npmjs.com/package/asynciterator)
that will contains all current and future data elements in this `AsyncReiterable`.
It will be ended once the `AsyncReiterable` is ended.

```javascript
const iterable = AsyncReiterableArray.fromInitialData([1, 2])

const it1 = iterable.iterator();
const it2 = iterable.iterator();

it1.on('data', console.log);
it2.on('data', console.log);

iterable.push(3);
iterable.push(4);
iterable.push(null);

# Output from both iterators:
#   1
#   2
#   3
#   4
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
