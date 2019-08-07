const isEmpty = require('is-empty');
const Client = require('graphql-ld').Client;
const QueryEngineComunica = require('graphql-ld-comunica').QueryEngineComunica;

const comunicaConfig = {
    sources: [{"type":"sparql","value":"http://dbpedia.org/sparql"}]
};

const executeQuery = async (comunicaConfig, graphQLLD, variables, queryParams) => {
    let newQuery = substituteVariables(graphQLLD.query, variables);
    newQuery = substituteQueryParams(newQuery, queryParams);
    const client = new Client({ context: graphQLLD.context, queryEngine: new QueryEngineComunica(comunicaConfig) });
    return await client.query({ query: newQuery })
};

const substituteVariables = (query, variables) => {
    if (!isEmpty(variables)) {
        let newQuery = query;
        Object.keys(variables).forEach(key => {
            // Replace underscores with spaces
            const val = variables[key].replace(/_/g, ' ');
            newQuery = newQuery.replace('$' + key, '"' + val + '"');
        });
        return newQuery;
    } else {
        return query;
    }
};

const substituteQueryParams = (query, params) => {
  if (!isEmpty(params)) {
      const keys = Object.keys(params);
      if (keys.includes('page') && keys.includes('limit')) {
          params.offset = Number(params.page) * params.limit;
      }
      delete params.page;
      delete params.limit;

      return substituteVariables(query, params);
  } else {
      return query;
  }
};

const getmoviesbradpitt = {"name":"getmoviesbradpitt","query":"{ id @single ... on Film { starring(label: \"Brad Pitt\") @single }}","context":{"@context":{"Film":"http://dbpedia.org/ontology/Film","label":{"@id":"http://www.w3.org/2000/01/rdf-schema#label","@language":"en"},"starring":"http://dbpedia.org/ontology/starring"}}};

const getmoviesactor = {"name":"getmoviesactor","query":"{ id @single ... on Film { starring(label: $actor) @single }}","context":{"@context":{"Film":"http://dbpedia.org/ontology/Film","label":{"@id":"http://www.w3.org/2000/01/rdf-schema#label","@language":"en"},"starring":"http://dbpedia.org/ontology/starring"}}};

const getmovies = {"name":"getmovies","query":"{ id @single ... on Film { starring(label: $actor) @single }}","context":{"@context":{"Film":"http://dbpedia.org/ontology/Film","label":{"@id":"http://www.w3.org/2000/01/rdf-schema#label","@language":"en"},"starring":"http://dbpedia.org/ontology/starring"}}};

const getdevelopersbelgian = {"name":"getdevelopersbelgian","query":"{ softwareName: label @single developer @single(scope: all) { label country(label_en: \"Belgium\") }}","context":{"@context":{"label":{"@id":"http://www.w3.org/2000/01/rdf-schema#label"},"label_en":{"@id":"http://www.w3.org/2000/01/rdf-schema#label","@language":"en"},"developer":{"@id":"http://dbpedia.org/ontology/developer"},"country":{"@id":"http://dbpedia.org/ontology/locationCountry"}}}};

module.exports = {
    executeQuery,
    substituteVariables,
    comunicaConfig,
    getmoviesbradpitt,
    getmoviesactor,
    getmovies,
    getdevelopersbelgian,
};
