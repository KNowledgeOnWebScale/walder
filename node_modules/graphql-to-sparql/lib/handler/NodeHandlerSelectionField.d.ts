import { FieldNode } from "graphql/language";
import { Algebra } from "sparqlalgebrajs";
import { IConvertContext } from "../IConvertContext";
import { IConvertSettings } from "../IConvertSettings";
import { Util } from "../Util";
import { NodeHandlerSelectionAdapter } from "./NodeHandlerSelectionAdapter";
/**
 * Converts GraphQL fields to one or more quad patterns.
 */
export declare class NodeHandlerSelectionField extends NodeHandlerSelectionAdapter<FieldNode> {
    constructor(util: Util, settings: IConvertSettings);
    handle(fieldNode: FieldNode, convertContext: IConvertContext): Algebra.Operation;
}
