const Client = require("graphql-ld").Client;
const QueryEngineComunica = require('graphql-ld-comunica').QueryEngineComunica;

// Define a JSON-LD context
const context = {
    "@context": {
        "Film": "http://dbpedia.org/ontology/Film",
        "label": {"@id": "http://www.w3.org/2000/01/rdf-schema#label", "@language": "en"},
        "starring": "http://dbpedia.org/ontology/starring"
    }
};
// Create a GraphQL-LD client based on a client-side Comunica engine over 3 sources
const comunicaConfig = {
    sources: [
        {type: "sparql", value: "http://dbpedia.org/sparql"},
        {type: "file", value: "https://ruben.verborgh.org/profile/"},
        {type: "hypermedia", value: "https://fragments.linkedsoftwaredependencies.org/npm"},
    ],
};
const client = new Client({context, queryEngine: new QueryEngineComunica(comunicaConfig)});

// Define a query
const query = `{
  id
  ... on Film {
    starring(label: "Brad Pitt")
  }
}`;

// Execute the query
const der = async () => {
    const {data} = await client.query({query});
    console.log(data);
};
der();
