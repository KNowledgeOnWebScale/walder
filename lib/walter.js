'use strict';

const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const YAML = require('yaml');
const GraphQLLD = require('./graphQLLD');
const fs = require('fs');
const util = require('util');
const UTILS = require('./utils');
const server = require('./server');

module.exports = class Walter {
  constructor(configFile, port) {
    if (!configFile) {
      throw Error('Configuration file is required.')
    }

    this.configFile = configFile;
    this.port = port ? port : 3000;
    this.app = express();
  }

  activate() {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                           Express initialisation                                               //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.app.use(logger('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({extended: false}));
    this.app.use(cookieParser());

    this.initialse();

    // catch 404 and forward to error handler
    this.app.use(function (req, res, next) {
      next(createError(404));
    });

    // error handler
    this.app.use(function (err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
    });

    this.server = server.initialise(this.app, this.port);
  };

  deactivate() {
    this.server.close((error) => {
      if (error) {
        throw Error(error);
      }
    })
  }


  initialse() {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                              Config file parsing                                               //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Parse the config file
    const file = fs.readFileSync(this.configFile, 'utf8');
    const yamlData = YAML.parse(file);

    // Data sources
    const DataSourceParser = require('./parsers/dataSourceParser');

    // Routes
    const RouteParser = require('./parsers/routeParser');
    const routeParser = new RouteParser(yamlData);

    // GraphQL-LD
    const GraphQLLDParser = require('./parsers/graphQLLDParser');
    const graphQLLDParser = new GraphQLLDParser(yamlData);

    // Pipe modules
    const PipeModuleParser = require('./parsers/pipeModuleParser');
    const pipeModuleParser = new PipeModuleParser(yamlData);

    const PipeModuleLoader = require('./loaders/pipeModuleLoader');
    const pipeModuleLoader = new PipeModuleLoader();

    // Data sources
    const dataSources = new DataSourceParser(yamlData).parse();

    // Set comunica data sources
    GraphQLLD.comunicaConfig.sources = dataSources;


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                     Express Route initialisation                                               //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Returns a function that executes the query and postprocessing. Used as the express route callback function.
     *
     * @param graphQLLD, Object containing all information required for GraphQL-LD query execution
     * @param pipeFunctions, List of postprocessing functions.
     * @returns {Function}, Express route callback
     */
    const queryCallback = (graphQLLD, pipeFunctions) => {
      return (req, res, next) => {
        GraphQLLD.executeQuery(GraphQLLD.comunicaConfig, graphQLLD, req.params, req.query)
          .then((data) => {
            // Postprocessing: Apply pipe modules to query result
            try {
              const pipeResult = UTILS.pipe(pipeFunctions)(data);
              res.send(pipeResult);
            }
            catch (e) {
              console.error('Pipe module error: ' + e.message);
              res.send(data);
            }
          })
          .catch((error) => {
            console.log(error);
            res.send(error.message);
          })
      }
    };

    // Iterate over routes
    for (let path in yamlData.paths) {
      for (let method in yamlData.paths[path]) {
        // Parse required route, GraphQL-LD and postprocessing info
        const route = routeParser.parse(path, method);
        const graphQLLD = graphQLLDParser.parse(path, method);
        const pipeModules = pipeModuleParser.parse(path, method);

        // Load remote and local pipe modules
        const pipeFunctions = pipeModuleLoader.load(pipeModules);

        const callBack = queryCallback(graphQLLD, pipeFunctions);

        switch (method) {
          case 'get':
            this.app.get(route.path, callBack);
            break;
          case 'post':
            this.app.post(route.path, callBack);
            break;
          case 'put':
            this.app.put(route.path, callBack);
            break;
          case 'patch':
            this.app.patch(route.path, callBack);
            break;
          case 'head':
            this.app.head(route.path, callBack);
            break;
          default:
            throw Error(util.format('"%s" is not a valid HTTP routing method.', method));
        }
      }
    }
  }
};
