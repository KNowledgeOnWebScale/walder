# JSON-LD Context Parser

[![Build Status](https://travis-ci.org/rubensworks/jsonld-context-parser.js.svg?branch=master)](https://travis-ci.org/rubensworks/jsonld-context-parser.js)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/jsonld-context-parser.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/jsonld-context-parser.js?branch=master)
[![npm version](https://badge.fury.io/js/jsonld-context-parser.svg)](https://www.npmjs.com/package/jsonld-context-parser) [![Greenkeeper badge](https://badges.greenkeeper.io/rubensworks/jsonld-context-parser.js.svg)](https://greenkeeper.io/)

A [JSON-LD](https://json-ld.org/) [`@context`](https://json-ld.org/spec/latest/json-ld/#the-context) parser that will normalize these contexts so that they can easily be used in your application.

This parser has the following functionality:
* Fetch contexts by URLs.
* Normalize JSON contexts.
* Merge arrays of contexts.
* Create a default `@base` entry if a base IRI is provided.
* Create `@id` entries for all `@reverse` occurences.
* Expand prefixes and `@vocab` in string values, `@id`, `@type` and `@reverse`.
* Context validation according to the [JSON-LD](https://json-ld.org/) specification while parsing (_can be disabled_).
* Term expansion with the `ContextParser.expandTerm` helper function.
* IRI compacting with the `ContextParser.compactIri` helper function.

Example input (with base IRI set to `http://example.org/base`):
```jsonld
[
  {
    "@vocab": "http://vocab.org/",
    "npmd": "https://linkedsoftwaredependencies.org/bundles/npm/",
    "p": { "@id": "pred1", "@language": "nl" }
  },
  "http://example.org/simple.jsonld",
]
```

With `http://example.org/simple.jsonld` containing:
```jsonld
{
  "xsd": "http://www.w3.org/2001/XMLSchema#",
  "name": "http://xmlns.com/foaf/0.1/name"
}
```

Example output:
```jsonld
{
  "@base": "http://example.org/base",
  "@vocab": "http://vocab.org/",

  "npmd": "https://linkedsoftwaredependencies.org/bundles/npm/",
  "p": { "@id": "http://vocab.org/pred1", "@language": "nl" },

  "xsd": "http://www.w3.org/2001/XMLSchema#",
  "name": "http://xmlns.com/foaf/0.1/name"
},
```

## Install

This package can be installed via [npm](https://www.npmjs.com/package/jsonld-context-parser).

```bash
$ npm install jsonld-context-parser
```

This package also works out-of-the-box in browsers via tools such as [webpack](https://webpack.js.org/) and [browserify](http://browserify.org/).

## Usage

### API

#### Create a new parser

```javascript
const ContextParser = require('jsonld-context-parse');

const myParser = new ContextParser();
```

Optionally, you can pass an options object with a custom [document loader](https://github.com/rubensworks/jsonld-context-parser.js/blob/master/lib/IDocumentLoader.ts):

```javascript
const myParser = new ContextParser({ documentLoader: myDocumentLoader });
```

#### Parse a context.

Either parse a context by URL:

```javascript
const myContext = await myParser.parse('http://json-ld.org/contexts/person.jsonld');
```

by an non-normalized context:
```javascript
const myContext = await myParser.parse({ ... });
```

or by an array of mixed contexts or URLs:
```javascript
const myContext = await myParser.parse([
  'http://json-ld.org/contexts/person.jsonld',
  { ... },
  'https://linkedsoftwaredependencies.org/contexts/components.jsonld'
]);
```

#### Expand a term

Based on a context, terms can be expanded in vocab or base-mode.

#### Base expansion

Base expansion is done based on the `@base` context entry.
This should typically be used for expanding terms in the subject or object position.

```
// Expands `person` based on the @base IRI. Will throw an error if the final IRI is invalid.
ContextParser.expandTerm('person', context);

// Expands if `foaf` is present in the context
ContextParser.expandTerm('foaf:name', context);

// Returns the URI as-is
ContextParser.expandTerm('http://xmlns.com/foaf/0.1/name', context);
```

#### Vocab expansion

Vocab expansion is done based on the `@vocab` context entry.
This should typically be used for expanding terms in the predicate position.

```
// Expands `name` based on the @vocab IRI.
ContextParser.expandTerm('name', context, true);

// Expands if `foaf` is present in the context
ContextParser.expandTerm('foaf:name', context, true);

// Returns the URI as-is
ContextParser.expandTerm('http://xmlns.com/foaf/0.1/name', context, true);
```

#### Compact an IRI

Based on a context, IRIs can be compacted in vocab or base-mode.

#### Base compacting

Base compacting is done based on the `@base` context entry.
This should typically be used for compacting terms in the subject or object position.

```
// Compacts to `something` if @base is `http://base.org/`.
ContextParser.compactIri('http://base.org/something', context);

// Compacts to `prefix:name` if `"prefix": "http://prefix.org/"` is in the context
ContextParser.compactIri('http://prefix.org/name', context);

// Returns the URI as-is if it is not present in the context in any way
ContextParser.compactIri('http://xmlns.com/foaf/0.1/name', context);
```

#### Vocab compacting

Vocab compacting is done based on the `@vocab` context entry.
This should typically be used for compacting terms in the predicate position.

```
// Compacts to `something` if @vocab is `http://vocab.org/`.
ContextParser.compactIri('http://vocab.org/something', context, true);

// Compacts to `prefix:name` if `"prefix": "http://prefix.org/"` is in the context
ContextParser.compactIri('http://prefix.org/name', context, true);

// Compacts to `term` if `"term": "http://term.org/"` is in the context
ContextParser.compactIri('http://term.org/', context, true);

// Returns the URI as-is if it is not present in the context in any way
ContextParser.compactIri('http://xmlns.com/foaf/0.1/name', context, true);
```

### Command-line

A command-line tool is provided to quickly normalize any context by URL, file or string.

Usage:
```
$ jsonld-context-parse url http://json-ld.org/contexts/person.jsonld
$ jsonld-context-parse file path/to/context.jsonld
$ jsonld-context-parse arg '{ "xsd": "http://www.w3.org/2001/XMLSchema#" }'
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
