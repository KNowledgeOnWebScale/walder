import { EnumValueNode } from "graphql/language";
import { IConvertContext } from "../../IConvertContext";
import { IConvertSettings } from "../../IConvertSettings";
import { Util } from "../../Util";
import { IValueNodeHandlerOutput, NodeValueHandlerAdapter } from "./NodeValueHandlerAdapter";
/**
 * Converts GraphQL enums to RDF named nodes.
 */
export declare class NodeValueHandlerEnum extends NodeValueHandlerAdapter<EnumValueNode> {
    constructor(util: Util, settings: IConvertSettings);
    handle(valueNode: EnumValueNode, fieldName: string, convertContext: IConvertContext): IValueNodeHandlerOutput;
}
