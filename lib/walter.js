'use strict';

const morgan = require('morgan');
const express = require('express');
const Logger = require('./logger');
const YAML = require('yaml');
const fs = require('fs');
const util = require('util');
const UTILS = require('./utils');
const server = require('./server');
const Path = require('path');
const accepts = require('accepts');
const pjson = require('../package');

module.exports = class Walter {
  constructor(configFile, port = 3000, logging, cache = true) {
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
          case 'text/html':
            HtmlConverter.convert(htmlInfo['200'], data, callback);
            break;
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
            // Requested media type is invalid --> send 415 and error message
            sendResponseCallback(res, 415, 'application/json')({
              status: 415,
              message: util.format('Requested invalid media type(s): %s', req.headers.accept)
            });
            break
        }
      }
      catch (error) {
        // If something goes wrong with the data reformatting, send html with error code 500
        console.error('Content negotiation (reformatting) error: ' + error.message);
        HtmlConverter.convert(htmlInfo['500'], {}, sendResponseCallback(res, 500, 'text/html'));
      }
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                          Express Route initialisation                                          //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //
    const GraphQLLD = require('./graphQLLD');
    this.graphQLLD = new GraphQLLD(this.cache);

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
        this.graphQLLD.executeQuery({sources: graphQLLD.datasources}, graphQLLD, req.params, req.query)
          .then((data) => {
            // Postprocessing: Apply pipe modules to query result
            try {
              const pipeResult = UTILS.pipe(pipeFunctions)(data);

              contentNegotiation(pipeResult.data, htmlInfo, graphQLLD, req, res);
            }
            catch (e) {
              // If something goes wrong with applying the pipe modules, send status code 500
              this.logger.error('Pipe module error: ' + e.message);
              HtmlConverter.convert(htmlInfo['500'], {}, sendResponseCallback(res, 500, 'text/html'));
            }
          })
          .catch((e) => {
            this.logger.error('GraphQL-LD error: ' + e.message);

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
      this.logger.info('Parsing route %s', path);

      for (let method in yamlData.paths[path]) {
        this.logger.info('    - Parsing method %s', method);

        // Parse required route, GraphQL-LD and postprocessing info
        this.logger.verbose('        * Parsing the express route information');
        const route = RouteParser.parse(path, method);

        this.logger.verbose('        * Parsing the GraphQL-LD information');
        const graphQLLD = GraphQLLDParser.parse(yamlData.paths[path][method].query, dataSources);

        this.logger.verbose('        * Parsing the parameters description');
        const parameters = ParameterParser.parse(yamlData.paths[path][method].parameters);

        this.logger.verbose('        * Parsing the pipe modules section');
        const pipeModules = PipeModuleParser.parse(yamlData.paths[path][method].postprocessing, resources['pipe-modules']);

        this.logger.verbose('        * Parsing the html template(s)');
        const htmlInfo = HtmlParser.parse(yamlData.paths[path][method].responses, resources.views);

        this.logger.verbose('        * Validating the current path and method');
        // Validate current path - method
        if (validator.validate(route, graphQLLD, parameters)) {
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

    // Finish the input validation
    validator.finish();


    // The 404 Route (ALWAYS Keep this as the last route)
    this.app.get('*', function (req, res) {
      HtmlConverter.convert(defaultErrorPages['404'], {}, sendResponseCallback(res, 404, 'text/html'));
    });
  }
};
