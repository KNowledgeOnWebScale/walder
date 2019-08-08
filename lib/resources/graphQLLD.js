// Code strings used by the GraphQLLDWriter

const GRAPHQLLD_CLIENT_IMPORT =
    `const Client = require('graphql-ld').Client;\n`;

const COMUNICA_QE_IMPORT =
    `const QueryEngineComunica = require('graphql-ld-comunica').QueryEngineComunica;\n`;

const COMUNICA_CONFIG_NAME =
    `comunicaConfig`;

const COMUNICA_CONFIG_DOC =
    `// Comunica engine configuration`;

const COMUNICA_CONFIG =
    `${COMUNICA_CONFIG_DOC}
const ${COMUNICA_CONFIG_NAME} = {
    sources: %s
};\n`;

const VARIABLE_SUBSTITUTION_FUNCTION_NAME =
    `substituteVariables`;
const VARIABLE_SUBSTITUTION_FUNCTION_DOC =
    `/**
 * Instantiates the given variables in the query.
 * 
 * @param query
 * @param variables
 * @returns newQuery
 */`;
const VARIABLE_SUBSTITUTION_FUNCTION =
    `${VARIABLE_SUBSTITUTION_FUNCTION_DOC}
const ${VARIABLE_SUBSTITUTION_FUNCTION_NAME} = (query, variables) => {
    if (!isEmpty(variables)) {
        let newQuery = query;
        Object.keys(variables).forEach(key => {
            // Replace underscores with spaces
            let val = variables[key];
            if (typeof val === 'string' || val instanceof String) {
                val = '"' + val.replace(/_/g, ' ') + '"';
            }
            newQuery = newQuery.replace('$' + key, val);
        });
        return newQuery;
    } else {
        return query;
    }
};\n`;

const QUERY_PARAMETER_SUBSTITUTION_FUNCTION_NAME =
    `substituteQueryParams`;
const QUERY_PARAMETER_SUBSTITUTION_FUNCTION_DOC =
    `/**
 * Instantiates the given query parameters in the query.
 * Pagination parameters are converted to GraphQL format.
 *
 * @param query
 * @param params
 * @returns newQuery
 */`;
const QUERY_PARAMETER_SUBSTITUTION_FUNCTION =
    `${QUERY_PARAMETER_SUBSTITUTION_FUNCTION_DOC}
const ${QUERY_PARAMETER_SUBSTITUTION_FUNCTION_NAME} = (query, params) => {
  if (!isEmpty(params)) {
      const keys = Object.keys(params);
      // Pagination parameters to GraphQL format
      if (keys.includes('page') && keys.includes('limit')) {
          params.limit = Number(params.limit);
          params.offset = Number(params.page) * params.limit;
      }
      delete params.page;
      return ${VARIABLE_SUBSTITUTION_FUNCTION_NAME}(query, params);
  } else {
      return query;
  }
};\n`;

const COMUNICA_EXECUTION_FUNCTION_NAME =
    `executeQuery`;
const COMUNICA_EXECUTION_FUNCTION_DOC =
    `/**
 * Instantiates the variables in the given GraphQL-LD query using the given path variables and query paremeters,
 * then executes the given GraphQL-LD query using comunica.
 *
 * @param comunicaConfig, Comunica engine configuration
 * @param graphQLLD, object containing the GraphQL query and JSON-LD context
 * @param variables, object containing path parameters to value mapping
 * @param queryParams, object containing query parameter to value mapping
 * @returns {Promise<>}, GraphQL-LD query results
 */`;
const COMUNICA_EXECUTION_FUNCTION =
    `${COMUNICA_EXECUTION_FUNCTION_DOC}
const ${COMUNICA_EXECUTION_FUNCTION_NAME} = async (comunicaConfig, graphQLLD, variables, queryParams) => {
    let newQuery = ${VARIABLE_SUBSTITUTION_FUNCTION_NAME}(graphQLLD.query, variables);
    newQuery = ${QUERY_PARAMETER_SUBSTITUTION_FUNCTION_NAME}(newQuery, queryParams);
    
    const client = new Client({ context: graphQLLD.context, queryEngine: new QueryEngineComunica(comunicaConfig) });
    
    return await client.query({ query: newQuery })
};\n`;


const COMUNICA_EXECUTE_QUERY_START =
    `    GraphQLLD.executeQuery(GraphQLLD.comunicaConfig, GraphQLLD.{0}, req.params, req.query).then( (data) => {`;
const COMUNICA_EXECUTE_QUERY_END =
    `        res.send(pipeResult);
    
    }).catch(error => {
        res.send(error.message)
    })`;

const QUERIES_SECTION_DOC =
    `// GraphQL-LD Queries\n`;
const QUERY =
    `const {0} = {1};\n`;


module.exports = {
    GRAPHQLLD_CLIENT_IMPORT,
    COMUNICA_QE_IMPORT,
    COMUNICA_CONFIG_NAME,
    COMUNICA_CONFIG,
    COMUNICA_EXECUTION_FUNCTION_NAME,
    COMUNICA_EXECUTION_FUNCTION,
    VARIABLE_SUBSTITUTION_FUNCTION_NAME,
    VARIABLE_SUBSTITUTION_FUNCTION,
    QUERY_PARAMETER_SUBSTITUTION_FUNCTION_NAME,
    QUERY_PARAMETER_SUBSTITUTION_FUNCTION,
    COMUNICA_EXECUTE_QUERY_START,
    COMUNICA_EXECUTE_QUERY_END,
    QUERIES_SECTION_DOC,
    QUERY
};