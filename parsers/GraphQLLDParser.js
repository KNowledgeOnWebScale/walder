const Parser = require('./parser');
const util = require('util');
const myUtils = require('../myUtils');

class GraphQLLD {
    constructor(name, query, context) {
        this.name = name;
        this.query = query;
        this.context = context;
    }
}

module.exports = class GraphQLLDParser extends Parser {
    constructor(method, path, data) {
        super(data);
        this.method = method;
        this.path = path;
    }

    parse() {
        // Extract the context
        const context = JSON.parse(this.data.paths[this.path][this.method]['json-ld-context']);
        // Extract the query
        const query = this.data.paths[this.path][this.method]['graphql-query'].replace(/\n/g, '').replace(/[ ]+/g, ' ');
        // Create the query name
        const name = util.format('%s%s', this.method, this.path.replace(/[^A-Za-z]/g, ''));

        return new GraphQLLD(name, query, context);
    }
};