import { InlineFragmentNode } from "graphql/language";
import { Algebra } from "sparqlalgebrajs";
import { IConvertContext } from "../IConvertContext";
import { IConvertSettings } from "../IConvertSettings";
import { Util } from "../Util";
import { NodeHandlerSelectionAdapter } from "./NodeHandlerSelectionAdapter";
/**
 * Converts GraphQL inline fragment to one or more quad patterns with a given type within an optional.
 */
export declare class NodeHandlerSelectionInlineFragment extends NodeHandlerSelectionAdapter<InlineFragmentNode> {
    constructor(util: Util, settings: IConvertSettings);
    handle(inlineFragmentNode: InlineFragmentNode, convertContext: IConvertContext): Algebra.Operation;
}
