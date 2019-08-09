'use strict';

const YAML = require('yaml');
const GraphQLLD = require('./graphQLLD');
const fs = require('fs');
const util = require('util');

module.exports.walterServer = (app) => {
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

    // Parse the config file
    const configFilePath = '/Users/driesmarzougui/Documents/work/IDLab/KNoWS/walter/example/config_example.yaml';   // todo: remove this
    const file = fs.readFileSync(configFilePath, 'utf8');
    const yamlData = YAML.parse(file);

    const dataSources = new DataSourceParser(yamlData).parse();


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                //
    //                                     Express Route initialisation                                               //
    //                                                                                                                //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const queryCallback = (graphQLLD, pipeModules) => {
        return (req, res, next) => {
            GraphQLLD.executeQuery(GraphQLLD.comunicaConfig, graphQLLD, req.params, req.query)
                .then((data) => {
                    // Apply pipe modules to query result
                    res.send(data);

                    next();
                })
                .catch((error) => {
                    res.send(error.message);
                })
        }
    };

    for (let path in yamlData.paths) {
        for (let method in yamlData.paths[path]) {
            const route = new RouteParser(method, path, yamlData).parse();
            const graphQLLD = new GraphQLLDParser(method, path, yamlData).parse();

            switch (method) {
                case 'get':
                    app.get(route.path, queryCallback(graphQLLD));
                    break;
                case 'post':
                    app.post(route.path, queryCallback(graphQLLD));
                    break;
                case 'put':
                    app.put(route.path, queryCallback(graphQLLD));
                    break;
                case 'patch':
                    app.patch(route.path, queryCallback(graphQLLD));
                    break;
                case 'head':
                    app.head(route.path, queryCallback(graphQLLD));
                default:
                    throw Error(util.format('"%s" is not a valid HTTP routing method.', this.method));
            }
        }

    }
};
