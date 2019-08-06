import { IConvertContext } from "../../IConvertContext";
import { IConvertSettings } from "../../IConvertSettings";
import { Util } from "../../Util";
import { DirectiveNodeHandlerAdapter, IDirectiveContext, IDirectiveNodeHandlerOutput } from "./DirectiveNodeHandlerAdapter";
/**
 * A handler for plural directives.
 */
export declare class DirectiveNodeHandlerPlural extends DirectiveNodeHandlerAdapter {
    constructor(util: Util, settings: IConvertSettings);
    handle(directiveContext: IDirectiveContext, convertContext: IConvertContext): IDirectiveNodeHandlerOutput;
}
