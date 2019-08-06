import { FieldNode, SelectionNode } from "graphql/language";
import { Algebra } from "sparqlalgebrajs";
import { IConvertContext } from "../IConvertContext";
import { IConvertSettings } from "../IConvertSettings";
import { Util } from "../Util";
import { INodeQuadContext, NodeHandlerAdapter } from "./NodeHandlerAdapter";
/**
 * A handler for converting GraphQL selection nodes to operations.
 */
export declare abstract class NodeHandlerSelectionAdapter<T extends SelectionNode> extends NodeHandlerAdapter<T> {
    constructor(targetKind: T['kind'], util: Util, settings: IConvertSettings);
    /**
     * Get the quad context of a field node that should be used for the whole definition node.
     * @param {FieldNode} field A field node.
     * @param {string} fieldLabel A field label.
     * @param {IConvertContext} convertContext A convert context.
     * @return {INodeQuadContext | null} The subject and optional auxiliary patterns.
     */
    getNodeQuadContextFieldNode(field: FieldNode, fieldLabel: string, convertContext: IConvertContext): INodeQuadContext | null;
    /**
     * Convert a field node to an operation.
     * @param {IConvertContext} convertContext A convert context.
     * @param {FieldNode} fieldNode The field node to convert.
     * @param {boolean} pushTerminalVariables If terminal variables should be created.
     * @param {Pattern[]} auxiliaryPatterns Optional patterns that should be part of the BGP.
     * @return {Operation} The reslting operation.
     */
    fieldToOperation(convertContext: IConvertContext, fieldNode: FieldNode, pushTerminalVariables: boolean, auxiliaryPatterns?: Algebra.Pattern[]): Algebra.Operation;
    /**
     * Check if the given node is a meta field, for things like introspection.
     * If so, return a new operation for this, otherwise, null is returned.
     * @param {IConvertContext} convertContext A convert context.
     * @param {Term} subject The subject.
     * @param {string} fieldLabel The field label to convert.
     * @param {Pattern[]} auxiliaryPatterns Optional patterns that should be part of the BGP.
     * @return {Operation} An operation or null.
     */
    handleMetaField(convertContext: IConvertContext, fieldLabel: string, auxiliaryPatterns?: Algebra.Pattern[]): Algebra.Operation;
}
