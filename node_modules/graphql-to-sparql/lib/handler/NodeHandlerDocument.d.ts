import { DocumentNode } from "graphql";
import { DefinitionNode } from "graphql/language";
import { Algebra } from "sparqlalgebrajs";
import { IConvertContext } from "../IConvertContext";
import { IConvertSettings } from "../IConvertSettings";
import { Util } from "../Util";
import { INodeQuadContext, NodeHandlerAdapter } from "./NodeHandlerAdapter";
/**
 * Converts GraphQL documents to joined operations for all its definitions.
 */
export declare class NodeHandlerDocument extends NodeHandlerAdapter<DocumentNode> {
    constructor(util: Util, settings: IConvertSettings);
    handle(document: DocumentNode, convertContext: IConvertContext): Algebra.Operation;
    /**
     * Get the quad context of a definition node that should be used for the whole definition node.
     * @param {DefinitionNode} definition A definition node.
     * @param {IConvertContext} convertContext A convert context.
     * @return {INodeQuadContext | null} The subject and optional auxiliary patterns.
     */
    getNodeQuadContextDefinitionNode(definition: DefinitionNode, convertContext: IConvertContext): INodeQuadContext | null;
    /**
     * Translates blank nodes inside the query to variables.
     * @param {Project} operation The operation to translate.
     * @return {Operation} The transformed operation.
     */
    translateBlankNodesToVariables(operation: Algebra.Project): Algebra.Operation;
}
