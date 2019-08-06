const Writer = require('./writer');
const fs = require('fs');
const util = require('util');

const GraphQLLD = require('../resources/graphQLLD');
const Global = require('../resources/global');


module.exports = class GraphQLLDWriter extends Writer {
    constructor(file, dataSources) {
        super(file);
        this.dataSources = dataSources;
        this.queries = [];
    }

    preWrite() {
        this.imports();
        this.initialiseComunica();

        fs.appendFileSync(this.file, this.sb.toString());

        this.sb.clear();
    }

    write(data) {
        this.queries.push(data);

        this.sb.appendLine();
        this.sb.appendFormat(GraphQLLD.QUERY, data.name, JSON.stringify(data));

        fs.appendFileSync(this.file, this.sb.toString());

        this.sb.clear();
    }

    postWrite() {
        this.sb.appendLine(Global.EXPORTS_START);
        this.sb.appendFormat(Global.EXPORT_OBJECT, GraphQLLD.COMUNICA_EXECUTION_FUNCTION_NAME);
        this.sb.appendFormat(Global.EXPORT_OBJECT, GraphQLLD.COMUNICA_CONFIG_NAME);

        this.queries.forEach((graphQLLD) => {
            this.sb.appendFormat(Global.EXPORT_OBJECT, graphQLLD.name)
        });

        this.sb.appendLine(Global.EXPORTS_END);

        fs.appendFileSync(this.file, this.sb.toString());

        this.sb.clear();
    }

    imports() {
        this.sb.append(GraphQLLD.GRAPHQLLD_CLIENT_IMPORT);
        this.sb.append(GraphQLLD.COMUNICA_QE_IMPORT);
    }

    initialiseComunica() {
        // util used for formatting because of string-builder bug
        this.sb.appendLine(util.format(GraphQLLD.COMUNICA_CONFIG, JSON.stringify(this.dataSources)));
        this.sb.appendLine(GraphQLLD.COMUNICA_EXECUTION_FUNCTION);
    }

    writeQueryExecution(sb) {
        const graphQLLD = this.queries.slice(-1).pop();

        sb.appendFormat(GraphQLLD.COMUNICA_EXECUTE_QUERY, graphQLLD.name);
    }
};
