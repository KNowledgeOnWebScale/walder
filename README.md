# Walter
This is Walter  
![](https://mattermost.ilabt.imec.be/files/gcsbmwrq4p86zmoismi6iz3brh/public?h=pTxrBbD5nCLDZtZIaXOv8dUGwLzqRu8gtLRZNLyD8U8)

Walter eats YAML config files and spits out [NodeJS](https://nodejs.org/en/)/[Express](https://expressjs.com/) server side code intended for Linked Data based web applications.

## Installation
1. Clone the repository.
2. Run `npm install` 

## Usage
Walter can be invoked using the CLI or via the programmatic API.

### CLI
Always run from the root folder of the project.

```
Usage: node walter [options]

Options:
  -v, --version                   output the version number
  -i, --input <configFile>        path to input YAML configuration file (required)
  -o, --output <outputDirectory>  path to desired output directory (default: CWD)
  -p, --port <portNumber>         application port number (default: 5656)
  -g, --generate                  generate a package.json file
  -h, --help                      output usage information
```

### Programmatic API

```js
const walter = require('./index').walter;

const configFile = '...';           // (String) path to input YAML configuration file
const outputDirectory = '...';      // (String) path to desired output directory (default: CWD)
const portNumber = 5656;            // (Number) application port number (default: 5656)
walter(configFile, outputDirectory, portNumber);
```

### Config file structure
* The config file is written in YAML somewhat following [OpenAPI 3.0](https://swagger.io/docs/specification/basic-structure/).
* A config file entry defines a route and has the following structure:

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
An example can be found in `meta/exampleOutput`.

Command used: 

`$ node bin/walter.js -i meta/exampleOutput/config_example.yaml -o meta/exampleOutput/ -g`


## Current functionality (v0.0.1)
* Generate routes
* Generate GraphQL-LD queries and execution code
* Load PipeModules and generate execution code
* Generate package.json and auto install packages
