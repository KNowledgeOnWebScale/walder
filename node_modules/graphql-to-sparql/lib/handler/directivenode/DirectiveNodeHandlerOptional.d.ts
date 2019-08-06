import { IConvertContext } from "../../IConvertContext";
import { IConvertSettings } from "../../IConvertSettings";
import { Util } from "../../Util";
import { DirectiveNodeHandlerAdapter, IDirectiveContext, IDirectiveNodeHandlerOutput } from "./DirectiveNodeHandlerAdapter";
/**
 * A handler for optional directives.
 */
export declare class DirectiveNodeHandlerOptional extends DirectiveNodeHandlerAdapter {
    constructor(util: Util, settings: IConvertSettings);
    handle(directiveContext: IDirectiveContext, convertContext: IConvertContext): IDirectiveNodeHandlerOutput;
}
