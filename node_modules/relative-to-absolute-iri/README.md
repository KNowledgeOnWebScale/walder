# Relative to Absolute IRI

[![Build Status](https://travis-ci.org/rubensworks/relative-to-absolute-iri.js.svg?branch=master)](https://travis-ci.org/rubensworks/relative-to-absolute-iri.js)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/relative-to-absolute-iri.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/relative-to-absolute-iri.js?branch=master)
[![npm version](https://badge.fury.io/js/relative-to-absolute-iri.svg)](https://www.npmjs.com/package/relative-to-absolute-iri) [![Greenkeeper badge](https://badges.greenkeeper.io/rubensworks/relative-to-absolute-iri.js.svg)](https://greenkeeper.io/)

Resolve relative IRIs to absolute IRIs given a base IRI,
conforming to [RFC3986](https://www.ietf.org/rfc/rfc3986.txt).

## Installation

```bash
$ yarn install relative-to-absolute-iri
```

This package also works out-of-the-box in browsers via tools such as [webpack](https://webpack.js.org/) and [browserify](http://browserify.org/).

## Require

```javascript
import {resolve} from "relative-to-absolute-iri";
```

_or_

```javascript
const resolve = require("relative-to-absolute-iri").resolve;
```

## Usage

### Parameters

This library exposes a single `resolve` function
that must be called with a relative IRI (string) as first argument,
and an optional base IRI (string) as second argument.
It will output an absolute IRI (string).

```javascript
resolve('relative', 'http://base.org/'); // Outputs 'http://base.org/relative'
```

### Relative IRIs

IRIs that are already relative will remain relative:

```javascript
resolve('http://example.org/'); // Outputs 'http://example.org/'
resolve('http://example.org/', 'http://base.org/'); // Outputs 'http://example.org/'
```

### Hashes

Fragments/hashes in relative IRIs are also taken into account.

```javascript
resolve('#abc', 'http://base.org/'); // Outputs 'http://base.org/#abc'
```

### Invalid base IRI

Invalid base IRIs cause an error to be thrown.

```javascript
resolve('abc', 'def'); // Error
```

### Relative to scheme

When a relative IRI starts with a `//`, then the scheme of the base IRI will be used.

```javascript
resolve('//abc', 'http://base.org/'); // Outputs 'http://abc'
```

### Absolute relative IRIs

Relative IRIs that starts with a `/` erase the path of the base IRI.

```javascript
resolve('/abc/def/', 'http://base.org/123/456/'); // Outputs 'http://base.org/abc/def/'
```

### Collapsing of dots

Relative IRIs that point to the current directory (`.`)
or parent directory (`..`) are collapsed.

```javascript
resolve('xyz', 'http://aa/parent/parent/../../a'); // Outputs 'http://aa/xyz'
resolve('xyz', 'http://aa/././a'); // Outputs 'http://aa/xyz'
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
