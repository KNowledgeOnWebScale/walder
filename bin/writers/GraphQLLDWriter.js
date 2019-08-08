const Writer = require('./writer');
const fs = require('fs');
const util = require('util');

const GraphQLLD = require('../resources/graphQLLD');
const Global = require('../resources/global');

/**
 *
 *
 * @type {module.GraphQLLDWriter}
 */
module.exports = class GraphQLLDWriter extends Writer {
    constructor(output, dataSources) {
        super(output);
        this.dataSources = dataSources;
        this.queries = [];
    }

    preWrite() {
        this.imports();
        this.initialiseComunica();

        super.preWrite();
    }

    write(data) {
        this.queries.push(data);

        this.sb.appendLine();
        this.sb.appendFormat(GraphQLLD.QUERY, data.name, JSON.stringify(data));

        super.write();
    }

    postWrite() {
        this.sb.appendLine(Global.EXPORTS_START);
        this.sb.appendFormat(Global.EXPORT_OBJECT, GraphQLLD.COMUNICA_EXECUTION_FUNCTION_NAME);
        this.sb.appendFormat(Global.EXPORT_OBJECT, GraphQLLD.COMUNICA_CONFIG_NAME);


        this.queries.forEach((graphQLLD) => {
            this.sb.appendFormat(Global.EXPORT_OBJECT, graphQLLD.name)
        });

        this.sb.appendLine(Global.EXPORTS_END);

        super.postWrite();
    }

    // Import statements
    imports() {
        this.sb.append(Global.IS_EMPTY_IMPORT);
        this.sb.append(GraphQLLD.GRAPHQLLD_CLIENT_IMPORT);
        this.sb.append(GraphQLLD.COMUNICA_QE_IMPORT);
    }

    // Comunica query execution functions
    initialiseComunica() {
        // util used for formatting because of string-builder bug
        this.sb.appendLine(util.format(GraphQLLD.COMUNICA_CONFIG, JSON.stringify(this.dataSources)));
        this.sb.appendLine(GraphQLLD.COMUNICA_EXECUTION_FUNCTION);

        this.sb.appendLine(GraphQLLD.VARIABLE_SUBSTITUTION_FUNCTION);
        this.sb.appendLine(GraphQLLD.QUERY_PARAMETER_SUBSTITUTION_FUNCTION);

        this.sb.appendLine(GraphQLLD.QUERIES_SECTION_DOC);
    }

    writeQueryExecutionStart(sb) {
        const graphQLLD = this.queries.slice(-1).pop();

        sb.appendFormat(GraphQLLD.COMUNICA_EXECUTE_QUERY_START, graphQLLD.name);
    }

    writeQueryExecutionEnd(sb) {
        sb.appendLine(GraphQLLD.COMUNICA_EXECUTE_QUERY_END);
    }
};
