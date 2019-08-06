# SPARQL to SPARQL Algebra converter
[![npm version](https://badge.fury.io/js/sparqlalgebrajs.svg)](https://www.npmjs.com/package/sparqlalgebrajs)
[![Build Status](https://travis-ci.org/joachimvh/SPARQLAlgebra.js.svg?branch=master)](https://travis-ci.org/joachimvh/SPARQLAlgebra.js) [![Greenkeeper badge](https://badges.greenkeeper.io/joachimvh/SPARQLAlgebra.js.svg)](https://greenkeeper.io/)

2 components get exposed: the **translate** function and the **Algebra** object,
which contains all the output types that can occur.

Note that this is still a work in progress so naming conventions could change.
There is also support for 'non-algebra' entities such as ASK, FROM, etc.
to make sure the output contains all relevant information from the query.

## Translate

Input for the translate function should either be a SPARQL string
or a result from calling [SPARQL.js](https://github.com/RubenVerborgh/SPARQL.js).

```javascript
const { translate } = require('sparqlalgebrajs');
translate('SELECT * WHERE { ?x ?y ?z }');
```
Returns:
```javascript
{ type: 'project',
  input: { type: 'bgp', patterns: [ 
    { type: 'pattern', subject: '?x', predicate: '?y', object: '?z' } ] },
  variables: [ '?x', '?y', '?z' ] }
```

Translating back to SPARQL can be done with the `toSparql` (or `toSparqlJs`) function.

## Algebra object
The algebra object contains a `types` object,
which contains all possible values for the `type` field in the output results.
Besides that it also contains all the TypeScript interfaces of the possible output results.
The output of the `translate` function will always be an `Algebra.Operation` instance.

## Deviations from the spec
This implementation tries to stay as close to the SPARQL 1.1
[specification](https://www.w3.org/TR/sparql11-query/#sparqlDefinition),
but some changes were made for ease of use.
These are mostly based on the Jena ARQ [implementation](https://jena.apache.org/documentation/query/).
What follows is a non-exhaustive list of deviations:

#### Named parameters
This is the biggest visual change.
The functions no longer take an ordered list of parameters but a named list instead.
The reason for this is to prevent having to memorize the order of parameters and also
due to seeing some differences between the spec and the Jena ARQ SSE output when ordering parameters.

#### Multiset/List conversion
The functions `toMultiset` and `toList` have been removed for brevity.
Conversions between the two are implied by the operations used.

#### Quads
The `translate` function has an optional second parameter
indicating whether patterns should be translated to triple or quad patterns.
In the case of quads the `graph` operation will be removed
and embedded into the patterns it contained.
The default value for this parameter is `false`.
```
PREFIX : <http://www.example.org/>

SELECT ?x WHERE {
    GRAPH ?g {?x ?y ?z}
}
```

Default result:
```javascript
{ type: 'project',
  input: { type: 'graph', graph: '?g', input:  
    { type: 'bgp', patterns: 
      [ { type: 'pattern', subject: '?x', predicate: '?y', object: '?z' } ] } },
  variables: [ '?x' ] }
```

With quads:
```javascript
{ type: 'project',
  input: { type: 'bgp', patterns: 
    [ { type: 'pattern', subject: '?x', predicate: '?y', object: '?z', graph: '?g' } ] },
  variables: [ '?x' ] }
```

#### VALUES
For the VALUES block we return the following output:
```
PREFIX dc:   <http://purl.org/dc/elements/1.1/> 
PREFIX :     <http://example.org/book/> 
PREFIX ns:   <http://example.org/ns#> 

SELECT ?book ?title ?price
{
   VALUES ?book { :book1 :book3 }
   ?book dc:title ?title ;
         ns:price ?price .
}
```
```javascript
{ type: 'project',
  input: 
   { type: 'join',
     left: { type: 'values', 
             variables: ['?book'],
             bindings: [
               { '?book': 'http://example.org/book/book1' },
               { '?book': 'http://example.org/book/book3' },
             ] },
     right: { type: 'bgp', 
              patterns: [
                {
                  type: 'pattern',
                  subject: '?book',
                  predicate: 'http://purl.org/dc/elements/1.1/title',
                  object: '?title'
                },
                {
                  type: 'pattern',
                  subject: '?book',
                  predicate: 'http://example.org/ns#price',
                  object: '?price'
                }
              ] } },
  variables: [ '?book', '?title', '?price' ] }
```

#### Differences from Jena ARQ
Some differences from Jena (again, non-exhaustive):
no prefixes are used (all uris get expanded)
and the project operation always gets used (even in the case of `SELECT *`).

## A note on tests
Every test consists of a sparql file and a corresponding json file containg the algebra result.
Tests ending with `(quads)` in their name are tested/generated with `quads: true` in the options.
