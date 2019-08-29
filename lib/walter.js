'use strict';

const morgan = require('morgan');
const express = require('express');
const Logger = require('./logger');
const YAML = require('yaml');
const fs = require('fs');
const util = require('util');
const server = require('./server');
const Path = require('path');
const pjson = require('../package');

module.exports = class Walter {
  constructor(configFile, port = 3000, logging = 'info', cache = true) {
    if (!configFile) {
      throw Error('Configuration file is required.')
    }

    this.version = pjson.version;

    this.configFile = configFile;
    if (!Path.isAbsolute(this.configFile)) {
      this.configFile = Path.resolve('./', configFile);
    }
    this.port = port;

    this.cache = cache;

    this.app = express();

    this.logging = logging;
  }

  /**
   * Starts the server.
   */
  activate() {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                             Logging initialisation                                             //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.logger = Logger(this.logging);

    // Set up morgan stream
    const logStream = {
      write: (message) => this.logger.info(message)
    };

    this.app.use(morgan('dev', { stream: logStream } ));

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                             Express initialisation                                             //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.logger.silly(`Walter v${this.version} booting up!`);

    this.app.use(express.json());
    this.app.use(express.urlencoded({extended: false}));

    this.initialise();

    // error handler
    this.app.use(function (err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
    });

    this.server = server.initialise(this.app, this.port);
  };

  /**
   * Stops the server.
   */
  deactivate() {
    this.logger.info('Deactivating...');
    this.server.close((error) => {
      if (error) {
        throw Error(error);
      }
      this.logger.info('Server shut down.')
    })
  }

  /**
   * Parse and process the config file.
   */
  initialise() {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                              Config file parsing                                               //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Parse the config file
    const file = fs.readFileSync(this.configFile, 'utf8');
    const yamlData = YAML.parse(file);

    // Resources
    const ResourceParser = require('./parsers/resourceParser');
    const resources = ResourceParser.parse(yamlData.resources, this.configFile);

    // Datasources
    const dataSources = yamlData.datasources;

    // Routes
    const RouteParser = require('./parsers/routeParser');

    // GraphQL-LD
    const GraphQLLDParser = require('./parsers/graphQLLDParser');

    // Parameters
    const ParameterParser = require('./parsers/parameterParser');

    // Pipe modules
    const PipeModuleParser = require('./parsers/pipeModuleParser');
    const PipeModuleLoader = require('./loaders/pipeModuleLoader');

    // html
    const HtmlParser = require('./parsers/htmlParser');

    // Parse the default error pages section
    const defaultErrorPages = HtmlParser.parse(yamlData.errors, resources.views);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                            Config file validation                                              //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const Validator = require('./validators/mainValidator');
    const validator = new Validator();

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                               Start static server                                              //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Start static file server
    this.logger.info('Starting static server...');
    this.app.use(express.static(resources.public));
    this.logger.info('Static server running.');

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                          Express Route initialisation                                          //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const RequestHandler = require('./handlers/requestHandler');
    this.requestHandler = new RequestHandler();

    // Iterate over routes
    for (let path in yamlData.paths) {
      this.logger.info('Parsing route %s', path);
      for (let method in yamlData.paths[path]) {
        this.logger.info('    - Parsing method %s', method);

        // Parse required route, GraphQL-LD and postprocessing info
        this.logger.verbose('        * Parsing the express route information');
        const routeInfo = RouteParser.parse(path, method);

        this.logger.verbose('        * Parsing the GraphQL-LD information');
        const graphQLLDInfo = GraphQLLDParser.parse(yamlData.paths[path][method].query, dataSources, this.cache);

        this.logger.verbose('        * Parsing the parameters description');
        const parameters = ParameterParser.parse(yamlData.paths[path][method].parameters);

        this.logger.verbose('        * Parsing the pipe modules section');
        const pipeModules = PipeModuleParser.parse(yamlData.paths[path][method].postprocessing, resources['pipe-modules']);

        this.logger.verbose('        * Parsing the html template(s)');
        const htmlInfo = HtmlParser.parse(yamlData.paths[path][method].responses, resources.views);

        // Validate current path - method
        this.logger.verbose('        * Validating the current path and method');
        if (validator.validate(routeInfo, graphQLLDInfo, parameters)) {
          Object.keys(validator.prevErrors).forEach((type) => {
            this.logger.error('%s:  %s', type, validator.prevErrors[type]);
          });
        }

        // Complete the htmlInfo object with possible missing default error pages
        for (let statusCode in defaultErrorPages) {
          if (!(statusCode in htmlInfo)) {
            htmlInfo[statusCode] = defaultErrorPages[statusCode];
          }
        }

        // Load remote and local pipe modules
        const pipeFunctions = PipeModuleLoader.load(pipeModules);

        const callBack = this.requestHandler.handle(graphQLLDInfo, pipeFunctions, htmlInfo);

        switch (method) {
          case 'get':
            this.app.get(routeInfo.path, callBack);
            break;
          case 'post':
            this.app.post(routeInfo.path, callBack);
            break;
          case 'put':
            this.app.put(routeInfo.path, callBack);
            break;
          case 'patch':
            this.app.patch(routeInfo.path, callBack);
            break;
          case 'head':
            this.app.head(routeInfo.path, callBack);
            break;
          default:
            throw Error(util.format('"%s" is not a supported HTTP routing method.', method));
        }
      }
    }

    // Finish the input validation
    validator.finish();

    // The 404 Route (ALWAYS Keep this as the last route)
    this.app.get('*', this.requestHandler.handle({}, [], defaultErrorPages, 404));
  }
};
