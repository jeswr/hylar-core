"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newEngineDynamicArged = void 0;
const runner_1 = require("@comunica/runner");
/**
 * Create a new dynamic comunica engine.
 * @param {IQueryOptions} options Optional options on how to instantiate the query evaluator.
 * @param {string} moduleRootPath The path to the invoking module.
 * @param {string} defaultConfigPath The path to the config file.
 * @return {Promise<ActorInitSparql>} A promise that resolves to a fully wired comunica engine.
 */
function newEngineDynamicArged(options, moduleRootPath, defaultConfigPath) {
    var _a, _b, _c;
    if (!options.mainModulePath) {
        // This makes sure that our configuration is found by Components.js
        options.mainModulePath = moduleRootPath;
    }
    const configResourceUrl = (_a = options.configResourceUrl) !== null && _a !== void 0 ? _a : defaultConfigPath;
    const instanceUri = (_b = options.instanceUri) !== null && _b !== void 0 ? _b : 'urn:comunica:sparqlinit';
    // Instantiate the main runner so that all other actors are instantiated as well,
    // and find the SPARQL init actor with the given name
    const runnerInstanceUri = (_c = options.runnerInstanceUri) !== null && _c !== void 0 ? _c : 'urn:comunica:my';
    // This needs to happen before any promise gets generated
    return runner_1.instantiateComponent(configResourceUrl, runnerInstanceUri, options)
        .then((runner) => runner.collectActors({ engine: instanceUri }).engine);
}
exports.newEngineDynamicArged = newEngineDynamicArged;
//# sourceMappingURL=QueryDynamic.js.map