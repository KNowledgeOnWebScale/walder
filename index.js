'use strict';

const fs = require('fs');
const YAML = require('yaml');

// Output files
const routesOutput = './output/routes.js';
const graphQLLDOutput = './output/graphQLLDOutput.js';

fs.writeFileSync(routesOutput, '');
fs.writeFileSync(graphQLLDOutput, '');

// Data sources
const DataSourceParser = require('./parsers/DataSourceParser');

// Routes
const RouteParser = require('./parsers/RouteParser');
const RouteWriter = require('./writers/RouteWriter');

// GraphQL-LD
const GraphQLLDParser = require('./parsers/GraphQLLDParser');
const GraphQLLDWriter = require('./writers/GraphQLLDWriter');

// Parse the config file
const configFilePath = 'config_example.yaml';
const file = fs.readFileSync(configFilePath, 'utf8');
const yamlData = YAML.parse(file);

const dataSources = new DataSourceParser(yamlData).parse();

const routeWriter = new RouteWriter(routesOutput);
const graphQLLWriter = new GraphQLLDWriter(graphQLLDOutput, dataSources);

routeWriter.preWrite();
graphQLLWriter.preWrite();

for (let path in yamlData.paths) {
    for (let method in yamlData.paths[path]) {
        // GraphQL
        const graphQLLD = new GraphQLLDParser(method, path, yamlData).parse();
        graphQLLWriter.write(graphQLLD);

        // Route
        const route = new RouteParser(method, path, yamlData).parse();
        routeWriter.write(route, graphQLLWriter);

        // Pipe modules

        // HTMLTemplate
    }
}

graphQLLWriter.postWrite();