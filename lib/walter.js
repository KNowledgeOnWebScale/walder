'use strict';

const express = require('express');
const logger = require('morgan');
const YAML = require('yaml');
const fs = require('fs');
const util = require('util');
const server = require('./server');
const Path = require('path');

module.exports = class Walter {
  constructor(configFile, port = 3000, cache = true) {
    if (!configFile) {
      throw Error('Configuration file is required.')
    }

    this.configFile = configFile;
    if (!Path.isAbsolute(this.configFile)) {
      this.configFile = Path.resolve('./', configFile);
    }
    this.port = port;

    this.cache = cache;

    this.app = express();
  }

  /**
   * Starts the server.
   */
  activate() {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                             Express initialisation                                             //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.app.use(logger('dev'));
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
    this.server.close((error) => {
      if (error) {
        throw Error(error);
      }
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
    this.app.use(express.static(resources.public));

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                          Express Route initialisation                                          //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const RequestHandler = require('./handlers/requestHandler');

    // Iterate over routes
    for (let path in yamlData.paths) {
      for (let method in yamlData.paths[path]) {
        // Parse the route section
        const routeInfo = RouteParser.parse(path, method);
        // Parse the GraphQL-LD section
        const graphQLLDInfo = GraphQLLDParser.parse(yamlData.paths[path][method].query, dataSources, this.cache);
        // Parse the parameters section
        const parameters = ParameterParser.parse(yamlData.paths[path][method].parameters);
        // Parse the postprocessing section
        const pipeModules = PipeModuleParser.parse(yamlData.paths[path][method].postprocessing, resources['pipe-modules']);
        // Parse the responses section
        const htmlInfo = HtmlParser.parse(yamlData.paths[path][method].responses, resources.views);

        // Validate current path - method
        validator.validate(routeInfo, graphQLLDInfo, parameters);

        // Complete the htmlInfo object with possible missing default error pages
        for (let statusCode in defaultErrorPages) {
          if (!(statusCode in htmlInfo)) {
            htmlInfo[statusCode] = defaultErrorPages[statusCode];
          }
        }

        // Load remote and local pipe modules
        const pipeFunctions = PipeModuleLoader.load(pipeModules);

        const callBack = RequestHandler.handle(graphQLLDInfo, pipeFunctions, htmlInfo);

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
    this.app.get('*', RequestHandler.handle({}, [], defaultErrorPages, 404));
  }
};
