import { ParsingContext } from "../../ParsingContext";
import { Util } from "../../Util";
import { EntryHandlerKeyword } from "./EntryHandlerKeyword";
/**
 * Handles @graph entries.
 */
export declare class EntryHandlerKeywordGraph extends EntryHandlerKeyword {
    constructor();
    handle(parsingContext: ParsingContext, util: Util, key: any, keys: any[], value: any, depth: number): Promise<any>;
}
