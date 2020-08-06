![logo of Walder](logo/logo.png)

Walder enables an easy way to set up and run a linked data based ([NodeJS](https://nodejs.org/en/)/[Express](https://expressjs.com/)) web server, using only a configuration file describing the web server's API.

Using content negotiation, Walder makes the underlying linked data resources (SPARQL, TPF, RDF files, ...) available to the clients in HTML, RDF formats and JSON-LD.

**Table of contents**

- [Installation](#Installation)
- [Usage](#Usage)
  - [CLI](#CLI)
  - [Library](#Library)
  - [Config file structure](#Config-file-structure)
  - [Example](#Example)
  - [Options](#Options)
  - [Multiple config files](#Multiple-config-files)
  - [Content negotiation](#Content-negotiation)
  - [HTML templates](#HTML-templates)
- [Input validation](#Input-validation)
- [Error handling](#Error-handling)
- [Dependencies](#Dependencies)
- [Tests](#Tests)

## Installation

Install Walder globally via `yarn global add walder`.

For development, follow these steps:

1. Clone the repository.
2. Install dependencies via `yarn install`.
3. Install Walder globally via `$ yarn global add file:$(pwd)`.

## Usage

Walder is available as a [CLI](#CLI) and JavaScript [library](#Library).

### CLI

```bash
Usage: walder [options]

Options:
  -v, --version              output the version number
  -c, --config <configFile>  YAML configuration file input
  -p, --port [portNumber]    server port number (default: 3000)
  -l, --log [level]          enable logging and set logging level (one of [error, warn, info, verbose, debug]) (default: "info")
  --no-cache                 disable Comunica default caching
  -h, --help                 output usage information
```

### Library

```js
// From the root directory
const Walder = require('.');

const configFilePath = 'path/to/configfile';
const port = 9000; // Defaults to 3000 
const logging = 'info'; // Defaults to 'info' 
const cache = false;  // Defaults to true 

const walder = new Walder(configFilePath, {port, logging, cache, cwd});

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
  root:  # Path to the root folder of the directories used by Walder (absolute or relative to the directory containing the config file) - OPTIONAL (default: .)
  views:  # Path to directory containing template (view) files (absolute or relative to the root folder) - OPTIONAL (default: views)
  pipe-modules:  # Path to directory containing local pipe modules (absolute or relative to the root folder) - OPTIONAL (default: pipe-modules)
  public:  # Path to directory containing all files that should be available statically (e.g. stylesheets) (absolute or relative to the root folder) - OPTIONAL (default: public)
  layouts: # Path to directory containing all files that can be used by template files (absolute or relative to the root folder) - OPTIONAL (default: layouts)
x-walder-datasources:  # Default list of data sources
  - ...  # E.g. link to SPARQL endpoint or a GraphQL-LD query
paths:  # List of path entries
  path-entry-1:
    ...
  path-entry-2:
    ...
x-walder-errors: # Default error page views - status codes with files containing the HTML template (absolute path or relative to the views directory)
  404: ...
  500: ...
  ...
```

#### Resources

The `x-walder-resources` key of the config file contains paths to directories used by Walder.
This key and it's values are optional. 
If no paths are given, 
the following default values are used relative to the directory of the config file.

```yaml
root: .
views: views
pipe-modules: pipe-modules
public: public
layouts: layouts
```

To prevent the wrong files from being made public by Walder, 
when no path is given to the `public` field, 
Walder creates a new directory `public` if none is found in the current working directory and uses that one.

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
        source: ...  # Path leading to source code of the pipe module (absolute path or relative to the pipe-modules directory)
        parameters: # the parameters for the pipe module (OPTIONAL)
          - _data # (DEFAULT) this gives all the data, but all paths in the data object are supported (e.g. _data.0.employee)
          - ... # Additional parameters if you're function supports those (OPTIONAL)
    responses:  # Status codes with files containing the HTML template (absolute path or relative to the views directory)
      200: ...  # (REQUIRED)
      500: ...  # (OPTIONAL)
```

### Example

The following command starts a server on port 3000 (default) using an example config file.

`$ walder -c example/config.yaml `

This will start a server on `localhost:3000` with the following routes:

* <http://localhost:3000/bradpitt-directors> - Returns a list of directors of movies starring Brad Pitt.
* <http://localhost:3000/music/{musician}> - Returns a list of bands a given musician has written a song for.
For example, <http://localhost:3000/music/John%20Lennon> returns a list of bands John Lennon has written a song for.
* <http://localhost:3000/artist/{artist}?writer={name}> - Returns a list of a given artist's songs 
selecting only those written by a specific person identified by name. 
For example, <http://localhost:3000/artist/David%20Bowie?writer=John%20Lennon> returns a list of a given artist's songs written by a specific person.
* <http://localhost:3000/music/{artist}/postprocessed> - Returns a list of songs by a given artist 
that have 'star' in the title, using pipe modules.
For example, <http://localhost:3000/music/David%20Bowie/postprocessed> returns a list of songs by David Bowie that 
have 'star' in the title.

### Options

In the path entry above, 
`options` is defined as a global (optional) identifier that is being used by every query of that path.
We have two options where we can choose from: 
`sort` and `remove-duplicates`. 
With given syntax:

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

If you do not want `options` to be global for the whole path, 
you can define `options` per query.

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

The following command starts a server using [this](example/config-sorting-duplicates.yaml) config file.

`$ walder -c example/config-sorting-duplicates.yaml`

This will start a server on `localhost:3000` with the following routes:

* <http://localhost:3000/music/{musician}/sorted> - 
Returns a list of bands a given musician has written a song for. 
The songs are sorted in descending order by song number.
For example, <http://localhost:3000/music/John%20Lennon/sorted> returns a list of such songs by John Lennon.
* <http://localhost:3000/music/{musician}/no_duplicates> - 
Returns a list of bands a given musician has written a song for.
All the duplicate song numbers are removed from the list.
For example, <http://localhost:3000/music/John%20Lennon/no_duplicates> returns a list of such songs by John Lennon.
* <http://localhost:3000/movies/{musician}/everything_together> - 
Returns a list of bands a given musician has written a song for.
The songs are ascendingly ordered by song number and only one song per artist is kept.
For example, <http://localhost:3000/music/John%20Lennon/everything_together> returns a list of such songs by John Lennon.
* <http://localhost:3000/artist/{artist}> - 
Returns a list of songs and movies for a given artist. 
Duplicate songs are removed and movies are descendingly ordered by id.
For example, <http://localhost:3000/artist/David%20Bowie> returns a list of such songs and movies.

### Multiple config files

It is possible to split a config file in multiple files.
This is done by using the `$ref` keyword. 
We follow the [OpenAPI 3.0 spec](https://swagger.io/docs/specification/using-ref/) 
that explains how to use the referencing.

When first referenced you need to use the path beginning from the directory of the config file, 
but if the referenced file has references itself, 
it can use paths relative to its own location, as shown below.

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
    $ref: './paths/music_musician.yaml'
  /movies/{actor}:
    $ref: './paths/movies_actor.yaml'
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

Using content negotiation, 
Walder makes the following output formats available:

* 'text/html'
* 'application/ld+json'
* 'text/turtle'
* 'application/n-triples'
* 'application/n-quads'

#### RDF

Since Walder uses [graphql-ld-comunica](https://www.npmjs.com/package/graphql-ld-comunica) to execute the GraphQL queries, 
which return JSON data, 
Walder first converts it into JSON-LD. 
This enables easy conversion to other RDF formats.

### HTML templates

Walder uses [consolidate](https://www.npmjs.com/package/consolidate) to automatically retrieve the corresponding engine for a given template. 
This means that the [supported template engines](https://www.npmjs.com/package/consolidate#supported-template-engines) 
are dependent on consolidate.

Different template engines can be used for different routes, e.g., 
one route's HTML can be rendered using [pug](https://pugjs.org/api/getting-started.html), 
while another one's can be rendered using [handlebars](https://handlebarsjs.com/). 
Walder does this all by looking at the file extension of the given template.

## Input validation

While parsing the config file, 
Walder also validates the correctness and completeness of the input.
When the whole config file is parsed and errors were found, 
Walder returns all errors and exits.
 
Currently, the following is validated:

- All variables in the GraphQL-LD query are described in the parameters section

## Error handling

Error pages are bound to a certain HTTP status code. 
You can define default error pages, 
but also path specific error pages by adding them to the `responses` key in the corresponding path entry.

### Currently-handled errors

#### Global

* Error `404`: Page not found
* Error `500`: Internal server error

#### Pipe modules

* Error `500`: Could not apply the given pipe modules

#### GraphQL-LD

* Error `404`: Expected variable was not given
* Error `500`: Could not execute the given query

### Example

When you run Walder using the following command:

`$ walder -c example/config-errors.yaml`

the following paths lead to errors:

* <http://localhost:3000/thisPageSurelyWontExist> &rarr; error `404` (Global: Page not found)
* <http://localhost:3000/bad_pipeModule> &rarr; error `500` (Pipe modules: Could not apply the given pipe modules)
* <http://localhost:3000/movies/brad_pitt> &rarr; error `404` (GraphQL-LD: Expected variable (page/limit) was not given)
* <http://localhost:3000/bad_query> &rarr; error `500` (GraphQL-LD: Could not execute the given query)

The following config file excerpt will use the path specific `moviesServerError.handlebars` template on errors leading to status code `500` when navigating to `/movies`.

When the required query parameter `actor` is not passed, the status code `404` is returned. 
Walder will use the default `error404.html` file since no path specific HTML template is given for the corresponding status.

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

| Library | License |
| ------- | ------- |
| [@comunica](https://github.com/comunica/) | MIT |
| [accepts](https://www.npmjs.com/package/accepts) | MIT
| [axios](https://www.npmjs.com/package/axios) | MIT
| [chai](https://www.npmjs.com/package/chai) | MIT
| [commander](https://www.npmjs.com/package/commander) | MIT |
| [consolidate](https://www.npmjs.com/package/consolidate) | MIT |
| [debug](https://www.npmjs.com/package/debug) | MIT |
| [express](https://www.npmjs.com/package/express) | MIT |
| [front-matter](https://www.npmjs.com/package/front-matter) | MIT |
| [fs-extra](https://www.npmjs.com/package/fs-extra) | MIT |
| [graphql-ld](https://www.npmjs.com/package/graphql-ld) | MIT |
| [graphql-ld-comunica](https://www.npmjs.com/package/graphql-ld-comunica) | MIT |
| [handlebars](https://www.npmjs.com/package/handlebars) | MIT |
| [is-html](https://www.npmjs.com/package/is-html) | MIT |
| [jade-to-handlebars](https://www.npmjs.com/package/jade-to-handlebars) | MIT |
| [json-refs](https://www.npmjs.com/package/json-refs) | MIT |
| [jsonld](https://www.npmjs.com/package/jsonld) | BSD-3-Clause |
| [jsonpath](https://www.npmjs.com/package/jsonpath) | MIT |
| [markdown-it](https://www.npmjs.com/package/markdown-it) | MIT |
| [mocha](https://www.npmjs.com/package/mocha) | MIT |
| [morgan](https://www.npmjs.com/package/morgan) | MIT |
| [n3](https://www.npmjs.com/package/n3) | MIT |
| [object-path](https://www.npmjs.com/package/object-path) | MIT |
| [pug](https://www.npmjs.com/package/pug) | MIT |
| [supertest](https://www.npmjs.com/package/supertest) | MIT |
| [tmp](https://www.npmjs.com/package/tmp) | MIT |
| [winston](https://www.npmjs.com/package/winston) | MIT |
| [yaml](https://www.npmjs.com/package/yaml) | ISC |

## Tests

* Test framework: [Mocha](https://www.npmjs.com/package/mocha)
* BDD / assertion library: [Chai](https://www.npmjs.com/package/chai)
* HTTP assertions: [SuperTest](https://www.npmjs.com/package/supertest)
