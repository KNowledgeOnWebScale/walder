import { RdfXmlParser } from "./RdfXmlParser";
/**
 * An error that includes line and column in the error message.
 */
export declare class ParseError extends Error {
    constructor(parser: RdfXmlParser, message: string);
}
