/// <reference types="node" />
import * as http from "http";
import EventEmitter = NodeJS.EventEmitter;
import minimist = require("minimist");
import { Writable } from "stream";
import { ActorInitSparql } from "./ActorInitSparql";
import { IQueryOptions } from "./QueryDynamic";
/**
 * An HTTP service that exposes a Comunica engine as a SPARQL endpoint.
 */
export declare class HttpServiceSparqlEndpoint {
    static readonly MIME_PLAIN = "text/plain";
    static readonly MIME_JSON = "application/json";
    static readonly HELP_MESSAGE = "comunica-sparql-http exposes a Comunica engine as SPARQL endpoint\n\ncontext should be a JSON object or the path to such a JSON file.\n\nUsage:\n  comunica-sparql-http context.json [-p port] [-t timeout] [-l log-level] [-i] [--help]\n  comunica-sparql-http \"{ \\\"sources\\\": [{ \\\"type\\\": \\\"hypermedia\\\", \\\"value\\\" : \\\"http://fragments.dbpedia.org/2015/en\\\" }]}\" [-p port] [-t timeout] [-l log-level] [-i] [--help]\n\nOptions:\n  -p            The HTTP port to run on (default: 3000)\n  -t            The query execution timeout in seconds (default: 60)\n  -l            Sets the log level (e.g., debug, info, warn, ... defaults to warn)\n  -i            A flag that enables cache invalidation before each query execution.\n  --help        print this help message\n";
    readonly engine: Promise<ActorInitSparql>;
    readonly context: any;
    readonly timeout: number;
    readonly port: number;
    readonly invalidateCacheBeforeQuery: boolean;
    constructor(args?: IHttpServiceSparqlEndpointArgs);
    /**
     * Starts the server
     * @param {string[]} argv The commandline arguments that the script was called with
     * @param {module:stream.internal.Writable} stdout The output stream to log to.
     * @param {module:stream.internal.Writable} stderr The error stream to log errors to.
     * @param {string} moduleRootPath The path to the invoking module.
     * @param {NodeJS.ProcessEnv} env The process env to get constants from.
     * @param {string} defaultConfigPath The path to get the config from if none is defined in the environment.
     * @param {(code: number) => void} exit The callback to invoke to stop the script.
     * @return {Promise<void>} A promise that resolves when the server has been started.
     */
    static runArgsInProcess(argv: string[], stdout: Writable, stderr: Writable, moduleRootPath: string, env: NodeJS.ProcessEnv, defaultConfigPath: string, exit: (code: number) => void): Promise<void>;
    /**
     * Takes parsed commandline arguments and turns them into an object used in the HttpServiceSparqlEndpoint constructor
     * @param {args: minimist.ParsedArgs} args The commandline arguments that the script was called with
     * @param {string} moduleRootPath The path to the invoking module.
     * @param {NodeJS.ProcessEnv} env The process env to get constants from.
     * @param {string} defaultConfigPath The path to get the config from if none is defined in the environment.
     */
    static generateConstructorArguments(args: minimist.ParsedArgs, moduleRootPath: string, env: NodeJS.ProcessEnv, defaultConfigPath: string): IHttpServiceSparqlEndpointArgs;
    /**
     * Start the HTTP service.
     * @param {module:stream.internal.Writable} stdout The output stream to log to.
     * @param {module:stream.internal.Writable} stderr The error stream to log errors to.
     */
    run(stdout: Writable, stderr: Writable): Promise<void>;
    /**
     * Handles an HTTP request.
     * @param {ActorInitSparql} engine A SPARQL engine.
     * @param {{type: string; quality: number}[]} variants Allowed variants.
     * @param {module:stream.internal.Writable} stdout Output stream.
     * @param {module:stream.internal.Writable} stderr Error output stream.
     * @param {module:http.IncomingMessage} request Request object.
     * @param {module:http.ServerResponse} response Response object.
     */
    handleRequest(engine: ActorInitSparql, variants: {
        type: string;
        quality: number;
    }[], stdout: Writable, stderr: Writable, request: http.IncomingMessage, response: http.ServerResponse): Promise<void>;
    /**
     * Writes the result of the given SPARQL query.
     * @param {ActorInitSparql} engine A SPARQL engine.
     * @param {module:stream.internal.Writable} stdout Output stream.
     * @param {module:stream.internal.Writable} stderr Error output stream.
     * @param {module:http.IncomingMessage} request Request object.
     * @param {module:http.ServerResponse} response Response object.
     * @param {string} sparql The SPARQL query string.
     * @param {string} mediaType The requested response media type.
     * @param {boolean} headOnly If only the header should be written.
     */
    writeQueryResult(engine: ActorInitSparql, stdout: Writable, stderr: Writable, request: http.IncomingMessage, response: http.ServerResponse, sparql: string, mediaType: string, headOnly: boolean): void;
    /**
     * Stop after timeout or if the connection is terminated
     * @param {module:http.ServerResponse} response Response object.
     * @param {NodeJS.ReadableStream} eventEmitter Query result stream.
     */
    stopResponse(response: http.ServerResponse, eventEmitter: EventEmitter): void;
    /**
     * Parses the body of a SPARQL POST request
     * @param {module:http.IncomingMessage} request Request object.
     * @return {Promise<string>} A promise resolving to a query string.
     */
    parseBody(request: http.IncomingMessage): Promise<string>;
}
export interface IHttpServiceSparqlEndpointArgs extends IQueryOptions {
    context?: any;
    timeout?: number;
    port?: number;
    invalidateCacheBeforeQuery?: boolean;
}
