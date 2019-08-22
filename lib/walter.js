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
  constructor(configFile, port) {
    if (!configFile) {
      throw Error('Configuration file is required.')
    }

    this.configFile = configFile;
    if (!Path.isAbsolute(this.configFile)) {
      this.configFile = Path.resolve('./', configFile);
    }
    this.port = port ? port : 3000;
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
    const resources = new ResourceParser(yamlData.resources, this.configFile).parse();

    // Datasources
    const DataSourceParser = require('./parsers/dataSourceParser');
    const dataSources = new DataSourceParser(yamlData.datasources).parse();

    // Routes
    const RouteParser = require('./parsers/routeParser');
    const routeParser = new RouteParser(yamlData);

    // GraphQL-LD
    const GraphQLLDParser = require('./parsers/graphQLLDParser');
    const graphQLLDParser = new GraphQLLDParser(yamlData);

    // Pipe modules
    const PipeModuleParser = require('./parsers/pipeModuleParser');
    const pipeModuleParser = new PipeModuleParser(yamlData, resources['pipe-modules']);

    const PipeModuleLoader = require('./loaders/pipeModuleLoader');
    const pipeModuleLoader = new PipeModuleLoader();

    // html
    const HtmlParser = require('./parsers/htmlParser');
    const htmlParser = new HtmlParser(yamlData);

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
    ];

    /**
     * Handles content negotiation.
     *
     * @param data, response data
     * @param htmlInfo, HTMLInfo object (see walter/lib/parsers/htmlParsers.js)
     * @param graphQLLD, GraphQLLD info object (see walter/lib/parsers/graphQLLDParser.js)
     * @param req, express 'request' object
     * @param res, express 'response' object
     */
    const contentNegotiation = (data, htmlInfo, graphQLLD, req, res) => {
      const accept = accepts(req);

      // the order of this list is significant; should be server preferred order
      try {
        switch (accept.type(CN_TYPES)) {
          case 'text/html':
            res.setHeader('Content-Type', 'text/html');
            HtmlConverter.convert(htmlInfo, data, (result) => res.send(result));
            break;
          case 'application/ld+json':
            res.setHeader('Content-Type', 'application/ld+json');
            RdfConverter.convert(RDF_TYPES.JSON_LD, data, graphQLLD, (result) => res.send(result));
            break;
          case 'text/turtle':
            res.setHeader('Content-Type', 'text/turtle');
            RdfConverter.convert(RDF_TYPES.TURTLE, data, graphQLLD, (result) => res.send(result));
            break;
          case 'application/n-triples':
            res.setHeader('Content-Type', 'application/n-triples');
            RdfConverter.convert(RDF_TYPES.NT, data, graphQLLD, (result) => res.send(result));
            break;
          case 'application/n-quads':
            res.setHeader('Content-Type', 'application/n-quads');
            RdfConverter.convert(RDF_TYPES.NQ, data, graphQLLD, (result) => res.send(result));
            break;
          default:
            // the fallback is application/json, so no need to specify it above
            res.setHeader('Content-Type', 'application/json');
            res.send(data);
            break
        }
      }
      catch (e) {
        // If something goes wrong with the data reformatting, send json data with error code 500
        console.error('Content negotiation (reformatting) error: ' + e.message);
        res
          .status(500)
          .json({
            status: 'Content negotiation (reformatting) error'
          });
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
              res
                .status(500)
                .json({
                  status: "Pipe module error"
                });
            }
          })
          .catch((e) => {
            console.log('GraphQL-LD error: ' + e.message);
            res
              .status(500)
              .json({
                status: "GraphQL-LD error"
              })
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
        const htmlInfo = htmlParser.parse(path, method, resources.views);

        // Load remote and local pipe modules
        const pipeFunctions = pipeModuleLoader.load(pipeModules);

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
  }
};
