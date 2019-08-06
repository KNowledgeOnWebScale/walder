import { OperationDefinitionNode } from "graphql/language";
import { Algebra } from "sparqlalgebrajs";
import { IConvertContext } from "../IConvertContext";
import { IConvertSettings } from "../IConvertSettings";
import { Util } from "../Util";
import { NodeHandlerDefinitionAdapter } from "./NodeHandlerDefinitionAdapter";
/**
 * Converts GraphQL definitions to joined operations for all its selections.
 */
export declare class NodeHandlerDefinitionOperation extends NodeHandlerDefinitionAdapter<OperationDefinitionNode> {
    constructor(util: Util, settings: IConvertSettings);
    handle(operationDefinition: OperationDefinitionNode, convertContext: IConvertContext): Algebra.Operation;
}
