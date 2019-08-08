# Walter
This is Walter  
![](https://mattermost.ilabt.imec.be/files/gcsbmwrq4p86zmoismi6iz3brh/public?h=pTxrBbD5nCLDZtZIaXOv8dUGwLzqRu8gtLRZNLyD8U8)

Walter eats YAML config files and spits out [NodeJS](https://nodejs.org/en/)/[Express](https://expressjs.com/) server side code intended for Linked Data based web applications.

## CLI
```
Usage: walter [options]

Options:
  -v, --version                   output the version number
  -i, --input <configFile>        path to input YAML configuration file (required)
  -o, --output <outputDirectory>  path to desired output directory (default: CWD)
  -p, --port <portNumber>         application port number. Default: 5656
  -g, --generate                  generate a package.json file
  -h, --help                      output usage information
```

## Current functionality (v0.0.1)
* Generate routes
* Generate GraphQL-LD queries and execution code
* Load PipeModules and generate execution code
* Generate package.json and auto install packages
