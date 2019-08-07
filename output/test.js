const Client = require('graphql-ld').Client;
const QueryEngineComunica = require('graphql-ld-comunica').QueryEngineComunica;
const Map = require('immutable').Map;
const RDFJSFactory = require('@rdfjs/data-model');

// Define a JSON-LD context
const context = {
    "@context": {
        "Film": "http://dbpedia.org/ontology/Film",
        "label": {"@id": "http://www.w3.org/2000/01/rdf-schema#label", "@language": "en"},
        "starring": "http://dbpedia.org/ontology/starring"
    }
};

const bindings = {
    "?actor": RDFJSFactory.literal("Angelina Jolie")
};

const bnds = {
    actor: "Angelina_Jolie"
};

// Create a GraphQL-LD client based on a client-side Comunica engine over 3 sources
const comunicaConfig = {
    sources: [
        {type: "sparql", value: "http://dbpedia.org/sparql"},
    ],
    initialBindings: bindings
};
const client = new Client({context, queryEngine: new QueryEngineComunica(comunicaConfig)});

// Define a query
let query = `{
          id @single
          ... on Film {
            starring(label: $actor) @single
          }
        }`;

const variables = Object.keys(bnds);
variables.forEach(key => {
    const val = bnds[key].replace(/_/g, ' ');
    query = query.replace('$' + key, '"' + val + '"');
});

console.log(query);



// Execute the query
async function ex() {
    const data = await client.query({query: query});
    console.log(data);
}

ex();
