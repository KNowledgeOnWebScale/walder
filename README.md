# Walter

This is Walter  
![icon](https://mattermost.ilabt.imec.be/files/gcsbmwrq4p86zmoismi6iz3brh/public?h=pTxrBbD5nCLDZtZIaXOv8dUGwLzqRu8gtLRZNLyD8U8)

Walter reads YAML config files and starts a [NodeJS](https://nodejs.org/en/)/[Express](https://expressjs.com/) server
intended for Linked Data based web applications using [GraphQL-LD](https://comunica.github.io/Article-ISWC2018-Demo-GraphQlLD/).

## Installation

1. Clone the repository.
2. Run `npm install` in the project's root.

## Usage

Walter is supposed to be used using the CLI but can also be activated using the programmatic API.

### CLI

```bash
Usage: node bin/walter.js [options]

Options:
  -v, --version             output the version number
  -i, --input <configFile>  YAML configuration file input
  -p, --port <portNumber>   server port number (default: 3000)
  -h, --help                output usage information
```

### Programmatic API

```js
// From the root directory
const Walter = require('.');

const configFilePath = '.../...';
const portNumber = 9000;

const walter = new Walter(configFilePath, portNumber);

walter.activate();    // Starts the server
walter.deactivate();  // Stops the server
```

### Config file structure

* The config file is written in YAML somewhat following [OpenAPI 3.0](https://swagger.io/docs/specification/basic-structure/).
* The config file must have the following structure:

```yaml
resources:  # Directories used by Walter - OPTIONAL
  path:  # Path to the root folder of the directories used by Walter (absolute or relative to the directory containing the config file) - OPTIONAL
  views:  # Path to directory containing template (view) files (absolute or relative to the root folder) - OPTIONAL
  pipe-modules:  # Path to directory containing local pipe modules (absolute or relative to the root folder) - OPTIONAL
  public:  # Path to directory containing all files that should be available statically (e.g. stylesheets) (absolute or relative to the root folder) - OPTIONAL
datasources:  # Default list of datasources
  - ...  # E.g. link to SPARQL endpoint
paths:  # List of path entries.
  path-entry-1:
    ...
  path-entry-2:
    ...
errors: # Default error page views - status codes with files containing the html template (absolute path or relative to the views directory)
  404: ...
  500: ...
  ...
```

#### Resources

The resources section of the config file is meant to contain paths to directories used by Walter.

##### Defaults

The resources section and it's field are optional. If no paths are given, default values are used which lead to using the current working directory as the resource directory.

To prevent the wrong files from being made public by Walter, when no path is given to the `public` field, Walter creates a new directory `public` if none is found in the CWD and uses that one.

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
    query:
      graphql-query: ...  # The GraphQL query
      json-ld-context: ...  # The JSON-LD corresponding to the GraphQL query
      datasources:  # Query specific datasources (OPTIONAL)
        additional: ...  # Boolean stating that the following datasources are meant to be used on top of the default ones
        sources:  # List of query specific datasources
          - ...  # E.g. link to SPARQL endpoint
    postprocessing:  # The (list of) pipe modules used for postprocessing
      module-id:  # Identifier of the pipe module
        soure: ...  # Path leading to source code of the pipe module (absolute path or relative to the pipe-modules directory)
    responses:  # Status codes with files containing the html template (absolute path or relative to the views directory)
      200: ...  # (REQUIRED)
      500: ...  # (OPTIONAL)
```

### Example

The following command starts a server on port 9000 using an example config file.

`$ node bin/walter.js -i example/config_example.yaml -p 9000`

This will start a server on `localhost:9000` with the following routes:

* <http://localhost:9000/movies/brad_pitt?page=0&limit=8> - Returns a paginated list of all movies Brad Pitt stars in
* <http://localhost:9000/movies/{actor}> - Returns a list of all movies the given actor (e.g. `Angelina_Jolie`) stars in
* <http://localhost:9000/movies/{actor}/postprocessed> - Returns a list of the all movies the given actor (e.g. `Johnny_Depp`) stars in, filtered on movie titles containing 'A' and 'T' using pipe modules.

### Content negotiation

Using content negotiation, Walter makes the following output formats available:

* 'text/html'
* 'application/ld+json'
* 'text/turtle'
* 'application/n-triples'
* 'application/n-quads'

#### RDF

Since Walter uses [graphql-ld-comunica](https://www.npmjs.com/package/graphql-ld-comunica) to execute the GraphQL queries, which returns JSON data, Walter first converts it into JSON-LD. This enables easy conversion to other RDF formats.

### HTML templates

Walter uses [consolidate](https://www.npmjs.com/package/consolidate) to automatically retrieve the corresponding engine for a given template. This means that the [supported template engines](https://www.npmjs.com/package/consolidate#supported-template-engines) are dependent on consolidate.

Different template engines can be used for different routes, e.g. one route's HTML can be rendered using [pug](https://pugjs.org/api/getting-started.html), while another one's can be rendered using [handlebars](https://handlebarsjs.com/). Walter does this all by just looking at the file extension of the given template, no further specification required!

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

When activating Walter like in the example above, the following paths lead to errors:

* <http://localhost:9000/thisPageSurelyWontExist> &rarr; error `404` (Global: Page not found)
* <http://localhost:9000/bad_pipeModule> &rarr; error `500` (Pipe modules: Could not apply the given pipe modules)
* <http://localhost:9000/movies/brad_pitt> &rarr; error `404` (GraphQL-LD: Expected variable (page/limit) was not given)
* <http://localhost:9000/bad_query> &rarr; error `500` (GraphQL-LD: Could not execute the given query)


#### Config file

The following config file excerpt will use the path specific `moviesServerError.handlebars` template on errors leading to status code `500` when navigating to `/movies`.

When the required query parameter `actor` is not passed, the status code `404` is returned. Walter will use the default `error404.html` file since no path specific html template is given for the corresponding status.

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
        200: movies.pug
        500: moviesServerError.handlebars
errors:
  404: error404.html
  500: error500.html
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
* [http-errors](https://www.npmjs.com/package/http-errors) - MIT
* [is-empty](https://www.npmjs.com/package/is-empty) - MIT
* [jsonld](https://www.npmjs.com/package/jsonld) - BSD-3-Clause
* [Mocha](https://www.npmjs.com/package/mocha) - MIT
* [morgan](https://www.npmjs.com/package/morgan) - MIT
* [N3](https://www.npmjs.com/package/n3) - MIT
* [SuperTest](https://www.npmjs.com/package/supertest) - MIT
* [yaml](https://www.npmjs.com/package/yaml) - ISC

## Current functionality &rarr; v0.0.2

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
