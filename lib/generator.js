'use strict';

const fs = require('fs');
const YAML = require('yaml');
const beautify = require('js-beautify');

/**
 * Takes a YAML config file and generates NodeJS/Express server side code intended for
 * Linked Data based web applications.
 *
 *
 * @param configFilePath, path to input YAML config file
 * @param outputDirectory, path to desired output directory
 * @param portNumber, application port number. Default: 5656
 */
module.exports = function generate(configFilePath, outputDirectory, portNumber) {
    const routesOutput = outputDirectory + '/routes.js';
    const graphQLLDOutput = outputDirectory + '/graphQLLD.js';
    const pipeModulesOuput = outputDirectory + '/pipeModules.js';
    const outputFiles = [routesOutput, graphQLLDOutput, pipeModulesOuput];

    // Create/Clear output files
    fs.writeFileSync(routesOutput, '');
    fs.writeFileSync(graphQLLDOutput, '');
    fs.writeFileSync(pipeModulesOuput, '');

    // Data sources
    const DataSourceParser = require('../lib/parsers/DataSourceParser');

    // Routes
    const RouteParser = require('../lib/parsers/RouteParser');
    const RouteWriter = require('../lib/writers/RouteWriter');

    // GraphQL-LD
    const GraphQLLDParser = require('../lib/parsers/GraphQLLDParser');
    const GraphQLLDWriter = require('../lib/writers/GraphQLLDWriter');

    // Pipe modules
    const PipeModuleParser = require('../lib/parsers/PipeModuleParser');
    const PipeModuleLoader = require('../lib/loaders/PipeModuleLoader');
    const PipeModuleWriter = require('../lib/writers/PipeModuleWriter');

    // Parse the config file
    const file = fs.readFileSync(configFilePath, 'utf8');
    const yamlData = YAML.parse(file);

    const dataSources = new DataSourceParser(yamlData).parse();

    const routeWriter = new RouteWriter(routesOutput, portNumber);
    const graphQLLWriter = new GraphQLLDWriter(graphQLLDOutput, dataSources);
    const pipeModulesWriter = new PipeModuleWriter(pipeModulesOuput);

    routeWriter.preWrite();
    graphQLLWriter.preWrite();
    pipeModulesWriter.preWrite();

    for (let path in yamlData.paths) {
        for (let method in yamlData.paths[path]) {
            // GraphQL
            const graphQLLD = new GraphQLLDParser(method, path, yamlData).parse();
            graphQLLWriter.write(graphQLLD);

            // Pipe modules
            const pipeModules = new PipeModuleParser(yamlData.paths[path][method].postprocessing).parse();
            const loadingPipeModules = new PipeModuleLoader(pipeModules).load();
            pipeModulesWriter.write(pipeModules, loadingPipeModules);

            // Routes
            const route = new RouteParser(method, path, yamlData).parse();
            routeWriter.write(route, graphQLLWriter, pipeModulesWriter);

            // HTMLTemplate
        }
    }

    graphQLLWriter.postWrite();
    pipeModulesWriter.postWrite();
    routeWriter.postWrite();

    // Format output code
    outputFiles.forEach(file => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                throw err;
            }
            fs.writeFileSync(file, beautify(data));
        })
    });
};
