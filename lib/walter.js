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
const Path = require('path');
const accepts = require('accepts');

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
    //                                             Express initialisation                                             //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.app.use(logger('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({extended: false}));
    this.app.use(cookieParser());

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

    // Meta
    const MetaParser = require('./parsers/metaParser');
    const meta = new MetaParser(yamlData.meta, this.configFile).parse();

    // Routes
    const RouteParser = require('./parsers/routeParser');
    const routeParser = new RouteParser(yamlData);

    // GraphQL-LD
    const GraphQLLDParser = require('./parsers/graphQLLDParser');
    const graphQLLDParser = new GraphQLLDParser(yamlData);

    // Pipe modules
    const PipeModuleParser = require('./parsers/pipeModuleParser');
    const pipeModuleParser = new PipeModuleParser(yamlData, Path.resolve(meta.resources.path, meta.resources['pipe-modules']));

    const PipeModuleLoader = require('./loaders/pipeModuleLoader');
    const pipeModuleLoader = new PipeModuleLoader();

    // html
    const HtmlParser = require('./parsers/htmlParser');
    const htmlParser = new HtmlParser(yamlData);

    // Set comunica data sources
    GraphQLLD.comunicaConfig.sources = meta.dataSources;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                               Start static server                                              //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Start static file server
    this.app.use(express.static(Path.resolve(meta.resources.path, meta.resources.public)));

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                             Data format conversion                                             //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // html
    const HtmlConverter = require('./converters/htmlConverter');

    // json-ld
    const JsonLDConverter = require('./converters/jsonLDConverter');

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

    const contentNegotiation = (data, htmlInfo, req, res) => {
      const accept = accepts(req);

      // the order of this list is significant; should be server preferred order
      switch (accept.type(CN_TYPES)) {
        case 'text/html':
          res.setHeader('Content-Type', 'text/html');f

          HtmlConverter.convert(htmlInfo, data)
            .then((html) => {
              res.send(html);
            })
            .catch((error) => {
              throw error;
            });
          break;
        case 'application/ld+json':
          res.setHeader('Content-Type', 'application/ld+json');
          JsonLDConverter.convert(data);
          break;
        case 'text/turtle':
          res.setHeader('Content-Type', 'text/turtle');
          break;
        case 'application/n-triples':
          res.setHeader('Content-Type', 'application/n-triples');
          break;
        case 'application/n-quads':
          res.setHeader('Content-Type', 'application/n-quads');
          break;
        default:
          // the fallback is text/plain, so no need to specify it above
          res.setHeader('Content-Type', 'text/plain');
          res.send(data);
          break
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

              contentNegotiation(pipeResult, htmlInfo, req, res);
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
        const htmlInfo = htmlParser.parse(path, method, Path.resolve(meta.resources.path, meta.resources.views));

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
