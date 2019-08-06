import { FragmentSpreadNode } from "graphql/language";
import { Algebra } from "sparqlalgebrajs";
import { IConvertContext } from "../IConvertContext";
import { IConvertSettings } from "../IConvertSettings";
import { Util } from "../Util";
import { NodeHandlerSelectionAdapter } from "./NodeHandlerSelectionAdapter";
/**
 * Converts GraphQL fragment spread to one or more quad patterns with a given type within an optional.
 */
export declare class NodeHandlerSelectionFragmentSpread extends NodeHandlerSelectionAdapter<FragmentSpreadNode> {
    constructor(util: Util, settings: IConvertSettings);
    handle(fragmentSpreadNode: FragmentSpreadNode, convertContext: IConvertContext): Algebra.Operation;
}
