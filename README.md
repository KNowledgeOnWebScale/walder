# Walder

This is Walder  
![icon](https://i.ibb.co/DbSckBS/Screenshot-2019-08-30-at-13-59-02.png)

Walder enables an easy way to set up and run a linked data based ([NodeJS](https://nodejs.org/en/)/[Express](https://expressjs.com/)) web server, using only a configuration file describing the web server's API.

Using content negotiation, Walder makes the underlying linked data resources (SPARQL, TPF, RDF files, ...) available to the clients in HTML, RDF formats and JSON-LD.


## Installation

1. Clone the repository.
2. Run `yarn install` in the project's root.

### Global install

(To be used during development.)

Running the following command in the project's root will install walder globally on your system:

`$ yarn global add file:$(pwd)`

## Usage

Walder is supposed to be used using the CLI but can also be activated using the programmatic API.

### CLI

```bash
Usage: node bin/cli.js [options]

Options:
  -v, --version              output the version number
  -c, --config <configFile>  YAML configuration file input
  -p, --port [portNumber]    server port number (default: 3000)
  -l, --log [level]          enable logging and set logging level (one of [error, warn, info, verbose, debug]) (default: "info")
  --no-cache                 disable comunica default caching
  -h, --help                 output usage information
```

### Programmatic API

```js
// From the root directory
const Walder = require('.');

const configFilePath = '.../...';
const portNumber = 9000; // Defaults to 3000 if not passed
const logging = 'info'; // Defaults to 'info' if not passed
const cache = false;  // Defaults to true if not passed

const walder = new Walder(configFilePath, portNumber, logging, cache);

walder.activate();    // Starts the server
walder.deactivate();  // Stops the server
```

### Config file structure

* The config file is written in YAML following [OpenAPI 3.0](https://swagger.io/docs/specification/basic-structure/).
* The config file must have the following structure:

```yaml
openapi: 3.0.2
info:  # OpenAPI metadata
  title: 'Example site'
  version: 0.1.0
x-walder-resources:  # Directories used by Walder - OPTIONAL
  path:  # Path to the root folder of the directories used by Walder (absolute or relative to the directory containing the config file) - OPTIONAL (default: .)
  views:  # Path to directory containing template (view) files (absolute or relative to the root folder) - OPTIONAL (default: .)
  pipe-modules:  # Path to directory containing local pipe modules (absolute or relative to the root folder) - OPTIONAL (default: .)
  public:  # Path to directory containing all files that should be available statically (e.g. stylesheets) (absolute or relative to the root folder) - OPTIONAL (default: ./public)
  layouts: # Path to directory containing all files that can be used by template files (absolute or relative to the root folder) - OPTIONAL (default: ./layouts)
x-walder-datasources:  # Default list of datasources
  - ...  # E.g. link to SPARQL endpoint
paths:  # List of path entries.
  path-entry-1:
    ...
  path-entry-2:
    ...
x-walder-errors: # Default error page views - status codes with files containing the html template (absolute path or relative to the views directory)
  404: ...
  500: ...
  ...
```

#### Resources

The resources section of the config file is meant to contain paths to directories used by Walder.

##### Defaults

The resources section and it's field are optional. If no paths are given, default values are used which lead to using the current working directory as the resource directory.

To prevent the wrong files from being made public by Walder, when no path is given to the `public` field, Walder creates a new directory `public` if none is found in the CWD and uses that one.

#### Path entry

A path entry defines a route and has the following structure:

```yaml
path:  # The path linked to this query
  request:  # The HTTP request type (GET, POST, etc.)
    summary: ...  # Short description
     parameters:  # Path variables/Query parameters
        - in: ...  # 'path' or 'query'
          name: ...  # Name of the parameter
          schema:
            type: ... # Type of the parameter
          description: ...  # Description of the parameter
    x-walder-query:
      graphql-query: ...  # One or more GraphQL queries
      json-ld-context: ...  # The JSON-LD corresponding to the GraphQL query
      options: # Global options that will be applied to all the graphql-queries of this path (OPTIONAL)
      datasources:  # Query specific datasources (OPTIONAL)
        additional: ...  # Boolean stating that the following datasources are meant to be used on top of the default ones
        sources:  # List of query specific datasources
          - ...  # E.g. link to SPARQL endpoint
    x-walder-postprocessing:  # The (list of) pipe modules used for postprocessing
      module-id:  # Identifier of the pipe module
        soure: ...  # Path leading to source code of the pipe module (absolute path or relative to the pipe-modules directory)
    responses:  # Status codes with files containing the html template (absolute path or relative to the views directory)
      200: ...  # (REQUIRED)
      500: ...  # (OPTIONAL)
```

### Example

The following command starts a server on port 9000 using an example config file.

`$ node bin/cli.js -c example/config_example.yaml -p 9000`

This will start a server on `localhost:9000` with the following routes:

* <http://localhost:9000/books/harvard> - Returns a list of books by San Franciscans owned by the Harvard Library.
* <http://localhost:9000/music/{musician}> - Returns a list of bands the given musician (e.g. `John Lennon`) has wrote a song for.
* <http://localhost:9000/movies/{actor}?page=0&limit=8> - Returns a paginated list of all movies the given actor (e.g. `Angelina_Jolie`) stars in.
* <http://localhost:9000/movies/{actor}/postprocessed> - Returns a list of the all movies the given actor (e.g. `Johnny_Depp`) stars in, filtered on movie titles containing 'A' and 'T' using pipe modules.

### Options

In the path entry above, options is defined as a global (optional) identifier that is being used by every query of that path.
We have two options where we can choose from: `sort` and `remove-duplicates`. With given syntax:

```yaml
options:
  sort: # Enable sorting on the data (OPTIONAL)
    object: # JSONPath to the object you want to sort for
    selectors: # The values inside the object over which you want to sort
      - ... # The default option when you want ascending order, just give the value (JSONPath notation supported for further nesting)
      - value: ...  # When you want descending order, specify the value/order (JSONPath notation supported for further nesting)
        order: desc
  remove-duplicates: # Enable the removal of duplicates of the data (OPTIONAL)
    object: ... # The JSONPath tot the object that you want to compare
    value: ... # The value that has to be compared to determine whether it's duplicate (JSONPath notation is also supported for further nesting)
```

If you don't want the options to be global for the whole path, one can also define options per query.

```yaml
path:  # The path linked to this query
  request:  # The HTTP request type (GET, POST, etc.)
    summary: ...  # Short description
     parameters:  # Path variables/Query parameters
        - in: ...  # 'path' or 'query'
          name: ...  # Name of the parameter
          schema:
            type: ... # Type of the parameter
          description: ...  # Description of the parameter
    x-walder-query:
      graphql-query: ...  # One or more GraphQL queries
        name:
          query: ... # The GraphQL query
          options: # options that will be applied only to this specific graphql-query (OPTIONAL)
...
```

### Options example

The following command starts a server on port 9000 using [this](example/config_example_sorting_duplicates.yaml) config file.

`$ node bin/cli.js -c example/config_example_sorting_duplicates.yaml -p 9000`

This will start a server on `localhost:9000` with the following routes:

* <http://localhost:9000/music/{musician}/sorted> - Returns a list of bands the given musician (e.g. `John Lennon`) has wrote a song for. Sorted in descending order by song number.
* <http://localhost:9000/music/{musician}/no_duplicates> - Returns a list of bands the given musician (e.g. `John Lennon`) has wrote a song for. Where all the duplicate song numbers are removed from the list.
* <http://localhost:9000/movies/{musician}/everything_together> - Returns a list of bands the given musician (e.g. `John Lennon`) has wrote a song for. Ordered in an ascending way by song number and removed the duplicate artists who performed a track written by the musician.
* <http://localhost:9000/artist/{artist}> - Returns a list of songs and movies for a given artist (e.g. `David Bowie`). Where duplicate songs are removed and the movies are ordered by id in descending manner.

### Referencing

When you are having a very big config file, the possibility is there that you want to split up your config file.
This can be obtained by using the `$ref` keyword. We follow the [OpenAPI 3.0 spec](https://swagger.io/docs/specification/using-ref/) that explains how to use the referencing.

When first referenced you need to use the path beginning from the project root, but if the referenced file has references itself, it can use paths relative to its own location, as shown below.

##### Example:
The actual config file referencing its paths
```yaml
openapi: 3.0.2
info:
  title: 'Example site'
  version: 0.1.0
x-walder-resources:
  path: ./
  views: views
  pipe-modules: pipeModules
  public: public
x-walder-datasources:
  - http://fragments.dbpedia.org/2016-04/en
paths:
  /music/{musician}:
    $ref: './example/paths/music_musician.yaml'
  /movies/{actor}:
    $ref: './example/paths/movies_actor.yaml'
x-walder-errors:
  404:
    description: page not found error
    x-walder-input-text/html: error404.html
  500:
    description: internal server error
    x-walder-input-text/html: error500.html
```
Below you see `./example/paths/music_musician.yaml` with reference with path relative to its own location
```yaml
get:
  summary: Returns a list of the all movies the given actor stars in
  parameters:
    - in: path
      name: actor
      required: true
      schema:
        type: string
      description: The target actor
  x-walder-query:
    $ref: '../walderQueryInfo/movies_actor_info.yaml'
  responses:
    200:
      description: list of movies
      x-walder-input-text/html: movies.pug

```
### Content negotiation

Using content negotiation, Walder makes the following output formats available:

* 'text/html'
* 'application/ld+json'
* 'text/turtle'
* 'application/n-triples'
* 'application/n-quads'

#### RDF

Since Walder uses [graphql-ld-comunica](https://www.npmjs.com/package/graphql-ld-comunica) to execute the GraphQL queries, which returns JSON data, Walder first converts it into JSON-LD. This enables easy conversion to other RDF formats.

### HTML templates

Walder uses [consolidate](https://www.npmjs.com/package/consolidate) to automatically retrieve the corresponding engine for a given template. This means that the [supported template engines](https://www.npmjs.com/package/consolidate#supported-template-engines) are dependent on consolidate.

Different template engines can be used for different routes, e.g. one route's HTML can be rendered using [pug](https://pugjs.org/api/getting-started.html), while another one's can be rendered using [handlebars](https://handlebarsjs.com/). Walder does this all by just looking at the file extension of the given template, no further specification required!

## Input validation

While parsing the config file, Walder also validates the correctness and completeness of the input.
When the whole config file is parsed and errors were found, Walder returns all errors and deactivates.
 
Currently the following is validated:

- All variables in the GraphQL-LD query are described in the parameters section

## Error handling

Error pages are bound to a certain HTTP status code. Users can define default error pages, but also path specific error pages by adding them to the `responses` section in the corresponding path entry.

### Currently handled errors

#### Global

* Error `404`: Page not found
* Error `500`: Internal server error

#### Pipe modules

* Error `500`: Could not apply the given pipe modules

#### GraphQL-LD

* Error `404`: Expected variable was not given
* Error `500`: Could not execute the given query

### Example

When activating Walder using the the following command:

`$ node bin/cli.js -c example/config_example_errors.yaml -p 9000`

the following paths lead to errors:


* <http://localhost:9000/thisPageSurelyWontExist> &rarr; error `404` (Global: Page not found)
* <http://localhost:9000/bad_pipeModule> &rarr; error `500` (Pipe modules: Could not apply the given pipe modules)
* <http://localhost:9000/movies/brad_pitt> &rarr; error `404` (GraphQL-LD: Expected variable (page/limit) was not given)
* <http://localhost:9000/bad_query> &rarr; error `500` (GraphQL-LD: Could not execute the given query)


#### Config file

The following config file excerpt will use the path specific `moviesServerError.handlebars` template on errors leading to status code `500` when navigating to `/movies`.

When the required query parameter `actor` is not passed, the status code `404` is returned. Walder will use the default `error404.html` file since no path specific html template is given for the corresponding status.

```yaml
...
paths:
  /movies:
    get:
      summary: Returns a list of the all movies the given actor stars in
      parameters:
        - in: query
          name: actor
          schema:
            type: string
            minimum: 0
          description: The actor from whom the movies are requested
          required: true
      x-walder-query:
        graphql-query: >
          {
            id @single
            ... on Film {
              starring(label: $actor) @single
            }
          }
        json-ld-context: >
          {
            "@context": {
              "Film": "http://dbpedia.org/ontology/Film",
              "label": { "@id": "http://www.w3.org/2000/01/rdf-schema#label", "@language": "en" },
              "starring": "http://dbpedia.org/ontology/starring"
            }
          }
      responses:
        200:
          description: list of movies
          x-walder-input-text/html: movies.pug
        500:
          description: internal movie server error
          x-walder-input-text/html: moviesServerError.handlebars
x-walder-errors:
  404:
    description: page not found error
    x-walder-input-text/html: error404.html
  500:
    description: internal server error
    x-walder-input-text/html: error500.html
```

## Dependencies

* [accepts](https://www.npmjs.com/package/accepts) - MIT
* [axios](https://www.npmjs.com/package/axios) - MIT
* [Chai](https://www.npmjs.com/package/chai) - MIT
* [commander](https://www.npmjs.com/package/commander) - MIT
* [consolidate](https://www.npmjs.com/package/consolidate) - MIT
* [debug](https://www.npmjs.com/package/debug) - MIT
* [express](https://www.npmjs.com/package/express) - MIT
* [graphql-ld](https://www.npmjs.com/package/graphql-ld) - MIT
* [graphql-ld-comunica](https://www.npmjs.com/package/graphql-ld-comunica) - MIT
* [jsonld](https://www.npmjs.com/package/jsonld) - BSD-3-Clause
* [Mocha](https://www.npmjs.com/package/mocha) - MIT
* [morgan](https://www.npmjs.com/package/morgan) - MIT
* [N3](https://www.npmjs.com/package/n3) - MIT
* [SuperTest](https://www.npmjs.com/package/supertest) - MIT
* [yaml](https://www.npmjs.com/package/yaml) - ISC

## Current functionality &rarr; v1.0.0

* [X]  Routing
  * [X]  Parse routing information from the config file
  * [X]  Set up express routes
* [X]  GraphQL-LD
  * [X]  Parse GraphQL-LD querying information from the config file
  * [X]  Add GraphQL-LD query execution to routing callback
  * [X]  Path specific and default data sources
* [X]  Pipe modules
  * [X]  Parse pipe modules information from the config file
  * [X]  Load local pipe modules
  * [X]  Add pipe modules to routing callback
* [X]  CLI
* [X]  Content negotiation
  * [X]  'text/html'
  * [X]  'application/ld+json'
  * [X]  'text/turtle'
  * [X]  'application/n-triples'
  * [X]  'application/n-quads'
* [X]  Error handling
* [X]  Config file validation
* [X]  Logging

## Tests

* Test framework: [Mocha](https://www.npmjs.com/package/mocha)
* BDD / assertion library: [Chai](https://www.npmjs.com/package/chai)
* HTTP assertions: [SuperTest](https://www.npmjs.com/package/supertest)

<!-- -->

* [x]  Parsers
  * [x]  GraphQLLDParser
  * [x]  PipeModuleParser
  * [x]  RouteParser
  * [x]  ResourceParser
  * [x]  HtmlParser
* [x]  Loaders
  * [x]  PipeModuleLoader
* [x]  Converters
  * [x]  HtmlConverter
  * [x]  RdfConverter
* [x]  Server
  * [x]  Server runs
  * [x]  Routes correctly initialised according to config file
  * [x]  Content negotiation
  * [x]  Error handling
* [x]  Functionality
  * [x]  GraphQL-LD queries get executed
  * [x]  PipeModules are applied
