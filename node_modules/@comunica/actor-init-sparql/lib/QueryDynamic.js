"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runner_1 = require("@comunica/runner");
/**
 * Create a new dynamic comunica engine.
 * @param {IQueryOptions} options Optional options on how to instantiate the query evaluator.
 * @param {string} moduleRootPath The path to the invoking module.
 * @param {string} defaultConfigPath The path to the config file.
 * @return {Promise<ActorInitSparql>} A promise that resolves to a fully wired comunica engine.
 */
function newEngineDynamicArged(options, moduleRootPath, defaultConfigPath) {
    if (!options.mainModulePath) {
        // This makes sure that our configuration is found by Components.js
        options.mainModulePath = moduleRootPath;
    }
    const configResourceUrl = options.configResourceUrl || defaultConfigPath;
    const instanceUri = options.instanceUri || 'urn:comunica:sparqlinit';
    // Instantiate the main runner so that all other actors are instantiated as well,
    // and find the SPARQL init actor with the given name
    const runnerInstanceUri = options.runnerInstanceUri || 'urn:comunica:my';
    // this needs to happen before any promise gets generated
    const rootAction = { argv: process.argv, env: process.env, stdin: process.stdin };
    return runner_1.Setup.instantiateComponent(configResourceUrl, runnerInstanceUri, rootAction, options)
        .then((runner) => {
        let actor = null;
        for (const runningActor of runner.actors) {
            if (runningActor.name === instanceUri) {
                actor = runningActor;
            }
        }
        if (!actor) {
            throw new Error('No SPARQL init actor was found with the name "' + instanceUri + '" in runner "'
                + runnerInstanceUri + '".');
        }
        return actor;
    });
}
exports.newEngineDynamicArged = newEngineDynamicArged;
//# sourceMappingURL=QueryDynamic.js.map