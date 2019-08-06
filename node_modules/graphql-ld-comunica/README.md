# Comunica for GraphQL-LD

[![Build Status](https://travis-ci.org/rubensworks/graphql-ld-comunica.js.svg?branch=master)](https://travis-ci.org/rubensworks/graphql-ld-comunica.js)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/graphql-ld-comunica.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/graphql-ld-comunica.js?branch=master)
[![npm version](https://badge.fury.io/js/graphql-ld-comunica.svg)](https://www.npmjs.com/package/graphql-ld-comunica) [![Greenkeeper badge](https://badges.greenkeeper.io/rubensworks/graphql-ld-comunica.js.svg)](https://greenkeeper.io/)

This is a [GraphQL-LD](https://github.com/rubensworks/graphql-ld.js) engine for executing queries using the [Comunica](https://github.com/comunica/comunica) query engine.

## Usage

_This requires you to install [graphql-ld-sparqlendpoint](https://github.com/rubensworks/graphql-ld-comunica.js): `yarn add graphql-ld-comunica`._

```javascript
import {Client} from "graphql-ld";
import {QueryEngineComunica} from "graphql-ld-comunica";

// Define a JSON-LD context
const context = {
  "@context": {
    "label": { "@id": "http://www.w3.org/2000/01/rdf-schema#label" }
  }
};

// Create a GraphQL-LD client based on a client-side Comunica engine over 3 sources
const comunicaConfig = {
  sources: [
    { type: "sparql", value: "'http://dbpedia.org/sparql'" },
    { type: "file", value: "https://ruben.verborgh.org/profile/" },
    { type: "hypermedia", value: "https://fragments.linkedsoftwaredependencies.org/npm" },
  ],
};
const client = new Client({ context, queryEngine: new QueryEngineComunica(comunicaConfig) });

// Define a query
const query = `
  query @single {
    label
  }`;

// Execute the query
const { data } = await client.query({ query });
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
