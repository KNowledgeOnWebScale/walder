import { ObjectValueNode } from "graphql/language";
import { IConvertContext } from "../../IConvertContext";
import { IConvertSettings } from "../../IConvertSettings";
import { Util } from "../../Util";
import { IValueNodeHandlerOutput, NodeValueHandlerAdapter } from "./NodeValueHandlerAdapter";
/**
 * Converts GraphQL objects to triple patterns by converting keys to predicates and values to objects.
 */
export declare class NodeValueHandlerObject extends NodeValueHandlerAdapter<ObjectValueNode> {
    constructor(util: Util, settings: IConvertSettings);
    handle(valueNode: ObjectValueNode, fieldName: string, convertContext: IConvertContext): IValueNodeHandlerOutput;
}
