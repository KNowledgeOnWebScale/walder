'use strict';

const Parser = require('./parser');
const util = require('util');


// Valid routing methods
const ROUTING_METHODS = ['get', 'post', 'put', 'delete', 'head', 'patch'];

class Route {
    constructor(method, path) {
        this.method = method;
        this.path = path;
    }
}

module.exports = class RouteParser extends Parser {
    constructor(method, path, data) {
        super(data);
        this.path = path;
        this.method = method;
    }

    parse() {
        // Check if method is valid
        if (!ROUTING_METHODS.includes(this.method)) {
            throw Error(util.format('"%s" is not a valid HTTP routing method.', this.method));
        }

        // Check for route parameters
        if (this.path.includes('{')) {
            this.path = this.path.replace('{', ':').replace('}', '');
        }

        // todo: Check for query parameters

        return new Route(this.method, this.path);
    }
};