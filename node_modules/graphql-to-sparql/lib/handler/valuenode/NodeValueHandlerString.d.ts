import { StringValueNode } from "graphql/language";
import { IConvertContext } from "../../IConvertContext";
import { IConvertSettings } from "../../IConvertSettings";
import { Util } from "../../Util";
import { IValueNodeHandlerOutput, NodeValueHandlerAdapter } from "./NodeValueHandlerAdapter";
/**
 * Converts GraphQL strings to RDF string terms, which can have a custom language or datatype.
 */
export declare class NodeValueHandlerString extends NodeValueHandlerAdapter<StringValueNode> {
    constructor(util: Util, settings: IConvertSettings);
    handle(valueNode: StringValueNode, fieldName: string, convertContext: IConvertContext): IValueNodeHandlerOutput;
}
