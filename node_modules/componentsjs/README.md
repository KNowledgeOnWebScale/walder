# Components.js

_A semantic dependency injection framework_

[![Build Status](https://travis-ci.org/LinkedSoftwareDependencies/Components.js.svg?branch=master)](https://travis-ci.org/LinkedSoftwareDependencies/Components.js)
[![npm version](https://badge.fury.io/js/componentsjs.svg)](https://www.npmjs.com/package/componentsjs)
[![DOI](https://zenodo.org/badge/90724301.svg)](https://zenodo.org/badge/latestdoi/90724301)

This repository contains the source code of Components.js.
Full documentation on its usage can be found at http://componentsjs.readthedocs.io/.

## Introduction

Components.js is a [dependency injection] framework for JavaScript applications.

Instead of hard-wiring software components together, Components.js allows these components to be _instantiated_ and _wired together_ declaratively using _semantic configuration files_.
The advantage of these semantic configuration files is that software components can be uniquely and globally identified using [URIs].

Configurations can be written in any [RDF] serialization, such as [JSON-LD].

This software is aimed for developers who want to build _modular_ and _easily configurable_ and _rewireable_ JavaScript applications.

## Quick Start

Components.js can be installed using npm:
```bash
$ [sudo] npm install componentsjs
```

#### 1. Define your module and its components

`my-module.jsonld`:
```json
{
  "@context": [
    "https://linkedsoftwaredependencies.org/bundles/npm/componentsjs/^3.0.0/components/context.jsonld",
    { "ex": "http://example.org/" }
  ],
  "@id": "ex:MyModule",
  "@type": "Module",
  "requireName": "my-module",
  "components": [
    {
      "@id": "ex:MyModule/MyComponent",
      "@type": "Class",
      "requireElement": "MyComponent",
      "parameters": [
        { "@id": "ex:MyModule/MyComponent#name", "unique": true }
      ],
      "constructorArguments": [
        { "@id": "ex:MyModule/MyComponent#name" }
      ]
    }
  ]
}
```

The npm module `my-module` exports a component with the name `MyComponent`.

The constructor of `MyComponent` takes a single `name` argument.

#### 2. Create a configuration file containing a component instantiation

`config-my-component.jsonld`:
```json
{
  "@context": [
    "https://linkedsoftwaredependencies.org/bundles/npm/componentsjs/^3.0.0/components/context.jsonld",
    {
      "ex": "http://example.org/",
      "name": "ex:MyModule/MyComponent#name"
    }
  ],
  "@id": "http://example.org/myInstance",
  "@type": "ex:MyModule/MyComponent",
  "name": "John"
}
```

This configuration is a semantic representation of the instantiation of `MyComponent` with `name` set to `"John"`.

#### 3. Instantiate your component programmatically

```javascript
...
const Loader = require('componentsjs').Loader;

const loader = new Loader();
await loader.registerModuleResourcesUrl('path/or/url/to/my-module.jsonld');
const myComponent = await loader.instantiateFromUrl(
    'http://example.org/myInstance', 'path/or/url/to/config-my-component.jsonld');
...
```

`myComponent` is an instance of type `MyComponent`, as defined in the config file.

[Components.js]: https://github.com/LinkedSoftwareDependencies/Components.js
[GitHub]: https://github.com/LinkedSoftwareDependencies/Documentation-Components.js
[dependency injection]: https://martinfowler.com/articles/injection.html
[Node.js]: https://nodejs.org/en/
[URIs]: https://www.w3.org/wiki/URI
[RDF]: https://www.w3.org/RDF/
[JSON-LD]: https://json-ld.org/

## License
Components.js is written by [Ruben Taelman](http://www.rubensworks.net/).

This code is copyrighted by [Ghent University – imec](http://idlab.ugent.be/)
and released under the [MIT license](http://opensource.org/licenses/MIT).
