# Walter
This is Walter  
![](https://mattermost.ilabt.imec.be/files/gcsbmwrq4p86zmoismi6iz3brh/public?h=pTxrBbD5nCLDZtZIaXOv8dUGwLzqRu8gtLRZNLyD8U8)

Walter reads YAML config files and starts a [NodeJS](https://nodejs.org/en/)/[Express](https://expressjs.com/) server 
intended for Linked Data based web applications using [GraphQL-LD](https://comunica.github.io/Article-ISWC2018-Demo-GraphQlLD/).

## Installation
1. Clone the repository.
2. Run `npm install` in the project's root.

## Usage
Walter is supposed to be used using the CLI but can also be activated using the programmatic API.

### CLI
```
Usage: node walter [options]

Options:
  -v, --version             output the version number
  -i, --input <configFile>  YAML configuration file input
  -p, --port <portNumber>   server port number (default: 3000)
  -h, --help                output usage information
```
### Programmatic API
```js
const Walter = require('../lib/walter');

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
datasources:  # Used datasources grouped by type
  type:  # Types are defined by which comunica engine it can be used with
    - url  # E.g. link to SPARQL endpoint
paths:  # List of path entries.
  path-entry-1:
    ...
  path-entry-2:
    ...
```

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
    graphql-query: ...  # The GraphQL query
    json-ld-context: ...  # The JSON-LD corresponding to the GraphQL query
    postprocessing:  # The (list of) pipe modules used for postprocessing
      module-id:  # Identifier of the pipe module
        soure: ...  # Path or URL leading to source code of the pipe module
    htmlTemplate: ...   # File containing the html template to visualise the data
```

### Example
The following command starts a server on port 9000 using an example config file.

`$ node bin/walter.js -i example/config_example.yaml -p 9000`

This will start a server on `localhost:9000` with the following routes:

* `localhost:9000/movies/brad_pitt?page=0&limit=8` - Returns a paginated list of all movies Brad Pitt stars in
* `localhost:9000/movies/{actor}` - Returns a list of all movies the given actor (e.g. `Angelina_Jolie`) stars in
* `localhost:9000/movies/{actor}/postprocessed` - Returns a list of the all movies the given actor (e.g. `Johnny_Depp`) stars in, filtered on movie titles containing 'A' and 'T' using pipe modules.


## Testing
* Test framework: [Mocha](https://mochajs.org)
* Assertion library: [Chai](https://www.chaijs.com/)


## Current functionality &rarr; v0.0.1
- [X]  Routing
    - [X]  Parse routing information from the config file
    - [X]  Set up express routes
- [X]  GraphQL-LD
    - [X]  Parse GraphQL-LD querying information from the config file
    - [X]  Add GraphQL-LD query execution to routing callback
- [X]  Pipe modules
    - [X]  Parse pipe modules information from the config file
    - [X]  Load local and remote pipe modules
    - [X]  Add pipe modules to routing callback
- [X]  CLI
