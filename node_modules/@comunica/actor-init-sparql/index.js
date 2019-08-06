"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./lib/ActorInitSparql"));
__export(require("./lib/HttpServiceSparqlEndpoint"));
var index_browser_1 = require("./index-browser");
exports.newEngine = index_browser_1.newEngine;
exports.evaluateQuery = index_browser_1.evaluateQuery;
const QueryDynamic_1 = require("./lib/QueryDynamic");
/**
 * Create a new dynamic comunica engine from a given config file.
 * @param {IQueryOptions} options Optional options on how to instantiate the query evaluator.
 * @return {Promise<QueryEngine>} A promise that resolves to a fully wired comunica engine.
 */
function newEngineDynamic(options) {
    return QueryDynamic_1.newEngineDynamicArged(options || {}, __dirname, __dirname + '/config/config-default.json');
}
exports.newEngineDynamic = newEngineDynamic;
//# sourceMappingURL=index.js.map