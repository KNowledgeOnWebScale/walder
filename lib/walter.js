'use strict';

const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const YAML = require('yaml');
const GraphQLLD = require('./graphQLLD');
const PipeModules = require('./pipeModules/pipeModules');
const fs = require('fs');
const util = require('util');
const UTILS = require('./utils');
const server = require('./server');

module.exports.activate = (configFile, port) => {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                           Express initialisation                                               //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const app = express();

    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(cookieParser());

    walter(app, configFile);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        next(createError(404));
    });

    // error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
    });

    server.initialise(app, port);

    return app;
};

const walter = (app, configFile) => {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                              Config file parsing                                               //
    //                                                                                                                //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Data sources
    const DataSourceParser = require('../lib/parsers/DataSourceParser');

    // Routes
    const RouteParser = require('../lib/parsers/RouteParser');

    // GraphQL-LD
    const GraphQLLDParser = require('../lib/parsers/GraphQLLDParser');

    // Pipe modules
    const PipeModuleParser = require('../lib/parsers/PipeModuleParser');
    const PipeModuleLoader = require('../lib/loaders/PipeModuleLoader');
    const pipeModuleLoader = new PipeModuleLoader();

    // Parse the config file
    const file = fs.readFileSync(configFile, 'utf8');
    const yamlData = YAML.parse(file);

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
            const route = new RouteParser(method, path, yamlData).parse();
            const graphQLLD = new GraphQLLDParser(method, path, yamlData).parse();
            const pipeModules = new PipeModuleParser(yamlData.paths[path][method].postprocessing).parse();

            // Load remote and local pipe modules
            pipeModuleLoader.load(pipeModules);

            const callBack = queryCallback(graphQLLD, pipeModules.map(pipeModule => {
                return PipeModules[pipeModule.name]
            }));

            switch (method) {
                case 'get':
                    app.get(route.path, callBack);
                    break;
                case 'post':
                    app.post(route.path, callBack);
                    break;
                case 'put':
                    app.put(route.path, callBack);
                    break;
                case 'patch':
                    app.patch(route.path, callBack);
                    break;
                case 'head':
                    app.head(route.path, callBack);
                default:
                    throw Error(util.format('"%s" is not a valid HTTP routing method.', this.method));
            }
        }
    }

    pipeModuleLoader.postLoad();
};
