'use strict';

const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const YAML = require('yaml');
const GraphQLLD = require('./graphQLLD');
const fs = require('fs');
const util = require('util');
const UTILS = require('./utils');
const server = require('./server');
const Path = require('path');
const accepts = require('accepts');

module.exports = class Walter {
  constructor(configFile, port, cache=true) {
    if (!configFile) {
      throw Error('Configuration file is required.')
    }

    this.configFile = configFile;
    if (!Path.isAbsolute(this.configFile)) {
      this.configFile = Path.resolve('./', configFile);
    }
    this.port = port ? port : 3000;

    this.cache = cache;

    this.app = express();
  }

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

  deactivate() {
    this.server.close((error) => {
      if (error) {
        throw Error(error);
      }
    })
  }


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
    const DataSourceParser = require('./parsers/dataSourceParser');
    const dataSources = DataSourceParser.parse(yamlData.datasources);

    // Routes
    const RouteParser = require('./parsers/routeParser');

    // GraphQL-LD
    const GraphQLLDParser = require('./parsers/graphQLLDParser');

    // Pipe modules
    const PipeModuleParser = require('./parsers/pipeModuleParser');
    const PipeModuleLoader = require('./loaders/pipeModuleLoader');

    // html
    const HtmlParser = require('./parsers/htmlParser');

    // Set comunica data sources
    GraphQLLD.comunicaConfig.sources = dataSources;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                               Start static server                                              //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Start static file server
    this.app.use(express.static(resources.public));

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                             Data format conversion                                             //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // html
    const HtmlConverter = require('./converters/htmlConverter');

    // rdf
    const RdfConverter = require('./converters/rdfConverter').RdfConverter;
    const RDF_TYPES = require('./converters/rdfConverter').RDF_TYPES;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                              Content negotiation                                               //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const CN_TYPES = [
      'text/html',
      'application/ld+json',
      'text/turtle',
      'application/n-triples',
      'application/n-quads',
      'application/json'
    ];

    /**
     * Creates the callback function which sends out the result with the appropriate content type header.
     *
     * @param res, Express response object
     * @param contentType, requested content type
     * @returns {Function}
     */
    const sendResponseCallback = (res, status, contentType) => {
      return (data) => {
        res
          .set('Content-Type', contentType)
          .status(status)
          .send(data)
          .end();
      }
    };

    /**
     * Handles content negotiation.
     *
     * @param data, response data
     * @param htmlInfo, {statusCode: HTMLInfo} object (see walter/lib/models/htmlInfo.js)
     * @param graphQLLD, GraphQLLD info object (see walter/lib/parsers/graphQLLDParser.js)
     * @param req, express 'request' object
     * @param res, express 'response' object
     */
    const contentNegotiation = (data, htmlInfo, graphQLLD, req, res) => {
      const accept = accepts(req);
      const callback = sendResponseCallback(res, 200, accept.type(CN_TYPES));


      try {
        // the order of this list is significant; should be server preferred order
        switch (accept.type(CN_TYPES)) {
          case 'application/ld+json':
            RdfConverter.convert(RDF_TYPES.JSON_LD, data, graphQLLD, callback);
            break;
          case 'text/turtle':
            RdfConverter.convert(RDF_TYPES.TURTLE, data, graphQLLD, callback);
            break;
          case 'application/n-triples':
            RdfConverter.convert(RDF_TYPES.NT, data, graphQLLD, callback);
            break;
          case 'application/n-quads':
            RdfConverter.convert(RDF_TYPES.NQ, data, graphQLLD, callback);
            break;
          case 'application/json':  // for dev reasons
            res
              .set('Content-Type', 'application/json')
              .send(data);
            break;
          default:
            // the default is text/html, so no need to specify it above
            HtmlConverter.convert(htmlInfo['200'], data, callback);
            break
        }
      }
      catch (error) {
        // If something goes wrong with the data reformatting, send json data with error code 500
        console.error('Content negotiation (reformatting) error: ' + error.message);
        HtmlConverter.convert(htmlInfo['500'], {}, sendResponseCallback(res, 500, 'text/html'));
      }

    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                          Express Route initialisation                                          //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Returns a function that executes the query and postprocessing. Used as the express route callback function.
     *
     * @param graphQLLD, Object containing all information required for GraphQL-LD query execution
     * @param pipeFunctions, List of postprocessing functions.
     * @param htmlInfo, { statusCode: HTMLInfo } object (see walter/lib/models/htmlInfo.js)
     * @returns {Function}, Express route callback
     */
    const requestCallback = (graphQLLD, pipeFunctions, htmlInfo) => {
      return (req, res, next) => {
        GraphQLLD.executeQuery(GraphQLLD.comunicaConfig, graphQLLD, req.params, req.query)
          .then((data) => {
            // Postprocessing: Apply pipe modules to query result
            try {
              const pipeResult = UTILS.pipe(pipeFunctions)(data);

              contentNegotiation(pipeResult.data, htmlInfo, graphQLLD, req, res);
            }
            catch (e) {
              // If something goes wrong with applying the pipe modules, send status code 500
              console.error('Pipe module error: ' + e.message);
              HtmlConverter.convert(htmlInfo['500'], {}, sendResponseCallback(res, 500, 'text/html'));
            }
          })
          .catch((e) => {
            console.error('GraphQL-LD error: ' + e.message);

            // Check what kind of error was thrown and respond appropriately
            let status = 500;
            if (e.message.includes('Variable')) {
              status = 404;
            }
            HtmlConverter.convert(htmlInfo[String(status)], {}, sendResponseCallback(res, status, 'text/html'));
          })
      }
    };

    // Parse the default error pages section
    const defaultErrorPages = HtmlParser.parse(yamlData.errors, resources.views);

    // Iterate over routes
    for (let path in yamlData.paths) {
      for (let method in yamlData.paths[path]) {
        // Parse required route, GraphQL-LD and postprocessing info
        const route = RouteParser.parse(path, method);
        const graphQLLD = GraphQLLDParser.parse(yamlData.paths[path][method]);
        const pipeModules = PipeModuleParser.parse(yamlData.paths[path][method].postprocessing, resources['pipe-modules']);
        const htmlInfo = HtmlParser.parse(yamlData.paths[path][method].responses, resources.views);

        // Complete the htmlInfo object with possible missing default error pages
        for (let statusCode in defaultErrorPages) {
          if (!(statusCode in htmlInfo)) {
            htmlInfo[statusCode] = defaultErrorPages[statusCode];
          }
        }

        // Load remote and local pipe modules
        const pipeFunctions = PipeModuleLoader.load(pipeModules);

        const callBack = requestCallback(graphQLLD, pipeFunctions, htmlInfo);

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
    // The 404 Route (ALWAYS Keep this as the last route)
    this.app.get('*', function (req, res) {
      HtmlConverter.convert(defaultErrorPages['404'], {}, sendResponseCallback(res, 404, 'text/html'));
    });
  }
};
