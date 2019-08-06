import { VariableNode } from "graphql/language/ast";
import { IConvertContext } from "../../IConvertContext";
import { IConvertSettings } from "../../IConvertSettings";
import { Util } from "../../Util";
import { IValueNodeHandlerOutput, NodeValueHandlerAdapter } from "./NodeValueHandlerAdapter";
/**
 * Converts GraphQL variables to terms based on the contents of the variablesDict.
 */
export declare class NodeValueHandlerVariable extends NodeValueHandlerAdapter<VariableNode> {
    constructor(util: Util, settings: IConvertSettings);
    handle(valueNode: VariableNode, fieldName: string, convertContext: IConvertContext): IValueNodeHandlerOutput;
}
