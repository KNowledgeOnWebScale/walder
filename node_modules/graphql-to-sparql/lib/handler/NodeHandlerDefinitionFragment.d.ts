import { FragmentDefinitionNode } from "graphql/language";
import { Algebra } from "sparqlalgebrajs";
import { IConvertContext } from "../IConvertContext";
import { IConvertSettings } from "../IConvertSettings";
import { Util } from "../Util";
import { NodeHandlerDefinitionAdapter } from "./NodeHandlerDefinitionAdapter";
/**
 * Errors if fragment definitions are found,
 * as these should have been processed away earlier.
 */
export declare class NodeHandlerDefinitionFragment extends NodeHandlerDefinitionAdapter<FragmentDefinitionNode> {
    constructor(util: Util, settings: IConvertSettings);
    handle(operationDefinition: FragmentDefinitionNode, convertContext: IConvertContext): Algebra.Operation;
}
