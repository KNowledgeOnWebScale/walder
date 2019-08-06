import { ISetupProperties } from "@comunica/runner";
import { ActorInitSparql } from "./ActorInitSparql";
/**
 * Create a new dynamic comunica engine.
 * @param {IQueryOptions} options Optional options on how to instantiate the query evaluator.
 * @param {string} moduleRootPath The path to the invoking module.
 * @param {string} defaultConfigPath The path to the config file.
 * @return {Promise<ActorInitSparql>} A promise that resolves to a fully wired comunica engine.
 */
export declare function newEngineDynamicArged(options: IQueryOptions, moduleRootPath: string, defaultConfigPath: string): Promise<ActorInitSparql>;
/**
 * Options for configuring how the query evaluator must be instantiated.
 */
export interface IQueryOptions extends ISetupProperties {
    /**
     * The URL or local path to a Components.js config file.
     */
    configResourceUrl?: string;
    /**
     * A URI identifying the component to instantiate.
     */
    instanceUri?: string;
    /**
     * A URI identifying the runner component.
     */
    runnerInstanceUri?: string;
}
