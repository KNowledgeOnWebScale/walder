# Walter
This is Walter  
![](https://mattermost.ilabt.imec.be/files/gcsbmwrq4p86zmoismi6iz3brh/public?h=pTxrBbD5nCLDZtZIaXOv8dUGwLzqRu8gtLRZNLyD8U8)

Walter reads YAML config files and starts a [NodeJS](https://nodejs.org/en/)/[Express](https://expressjs.com/) server intended for Linked Data based web applications.

## Installation
1. Clone the repository.
2. Run `npm install` 

## Usage
TODO
### CLI
TODO
### Programmatic API
TODO

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
TODO


## Current functionality &rarr; v0.0.1
- [X]  Routing
    - [X]  Parse routing information from the config file
    - [X]  Set up express routes
- [X]  GraphQL-LD
    - [X]  Parse GraphQL-LD querying information from the config file
    - [X]  Add GraphQL-LD query execution to routing callback
- [ ]  Pipe modules
    - [X]  Parse pipe modules information from the config file
    - [X]  Load pipe modules
    - [ ]  Add pipe modules to routing callback
 