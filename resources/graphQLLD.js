const GRAPHQLLD_CLIENT_IMPORT = 'const Client = require(\'graphql-ld\').Client;\n';

const COMUNICA_QE_IMPORT = 'const QueryEngineComunica = require(\'graphql-ld-comunica\').QueryEngineComunica;\n';
const COMUNICA_CONFIG_NAME = 'comunicaConfig';
const COMUNICA_CONFIG = `const ${COMUNICA_CONFIG_NAME} = {\n` +
    `    sources: %s\n` +
    `};\n`;
const COMUNICA_EXECUTION_FUNCTION_NAME = 'executeQuery';
const COMUNICA_EXECUTION_FUNCTION = `const ${COMUNICA_EXECUTION_FUNCTION_NAME} = async (comunicaConfig, graphQLLD) => {
    const client = new Client({ context: graphQLLD.context, queryEngine: new QueryEngineComunica(comunicaConfig) });
    return await client.query({ query: graphQLLD.query })
};\n`;
const COMUNICA_EXECUTE_QUERY_START = '    GraphQLLD.executeQuery(GraphQLLD.comunicaConfig, GraphQLLD.{0}).then( (data) => {';
const COMUNICA_EXECUTE_QUERY_END = '        res.send(pipeResult);\n\n' +
    '    }).catch(\n' +
    '        res.send(\'FAILED\')\n' +
    '    )';

const QUERY = 'const {0} = {1};\n';


module.exports = {
    GRAPHQLLD_CLIENT_IMPORT,
    COMUNICA_QE_IMPORT,
    COMUNICA_CONFIG_NAME,
    COMUNICA_CONFIG,
    COMUNICA_EXECUTION_FUNCTION_NAME,
    COMUNICA_EXECUTION_FUNCTION,
    COMUNICA_EXECUTE_QUERY_START,
    COMUNICA_EXECUTE_QUERY_END,
    QUERY
};