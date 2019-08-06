const Client = require('graphql-ld').Client;
const QueryEngineComunica = require('graphql-ld-comunica').QueryEngineComunica;

const comunicaConfig = {
    sources: [{"type":"sparql","value":"http://dbpedia.org/sparql"}]
};

const executeQuery = async (comunicaConfig, graphQLLD) => {
    const client = new Client({ context: graphQLLD.context, queryEngine: new QueryEngineComunica(comunicaConfig) });
    return await client.query({ query: graphQLLD.query })
};

const getmoviesbradpitt = {"name":"getmoviesbradpitt","query":"{ id @single ... on Film { starring(label: \"Brad Pitt\") @single }}","context":{"@context":{"Film":"http://dbpedia.org/ontology/Film","label":{"@id":"http://www.w3.org/2000/01/rdf-schema#label","@language":"en"},"starring":"http://dbpedia.org/ontology/starring"}}};

module.exports = {
    executeQuery,
    comunicaConfig,
    getmoviesbradpitt,
};
