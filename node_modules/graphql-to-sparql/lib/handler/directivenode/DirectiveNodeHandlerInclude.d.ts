import { IConvertContext } from "../../IConvertContext";
import { IConvertSettings } from "../../IConvertSettings";
import { Util } from "../../Util";
import { DirectiveNodeHandlerAdapter, IDirectiveContext, IDirectiveNodeHandlerOutput } from "./DirectiveNodeHandlerAdapter";
/**
 * A handler for include directives.
 */
export declare class DirectiveNodeHandlerInclude extends DirectiveNodeHandlerAdapter {
    constructor(util: Util, settings: IConvertSettings);
    handle(directiveContext: IDirectiveContext, convertContext: IConvertContext): IDirectiveNodeHandlerOutput;
}
