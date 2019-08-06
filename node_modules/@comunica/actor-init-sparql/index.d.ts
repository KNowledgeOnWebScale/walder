export * from './lib/ActorInitSparql';
export * from './lib/HttpServiceSparqlEndpoint';
export { newEngine, evaluateQuery } from './index-browser';
import { ActorInitSparql } from "./lib/ActorInitSparql";
import { IQueryOptions } from "./lib/QueryDynamic";
/**
 * Create a new dynamic comunica engine from a given config file.
 * @param {IQueryOptions} options Optional options on how to instantiate the query evaluator.
 * @return {Promise<QueryEngine>} A promise that resolves to a fully wired comunica engine.
 */
export declare function newEngineDynamic(options?: IQueryOptions): Promise<ActorInitSparql>;
