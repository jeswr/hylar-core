"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newEngineDynamic = exports.bindingsStreamToGraphQl = exports.evaluateQuery = exports.newEngine = void 0;
__exportStar(require("./lib/ActorInitSparql"), exports);
__exportStar(require("./lib/HttpServiceSparqlEndpoint"), exports);
var index_browser_1 = require("./index-browser");
Object.defineProperty(exports, "newEngine", { enumerable: true, get: function () { return index_browser_1.newEngine; } });
Object.defineProperty(exports, "evaluateQuery", { enumerable: true, get: function () { return index_browser_1.evaluateQuery; } });
Object.defineProperty(exports, "bindingsStreamToGraphQl", { enumerable: true, get: function () { return index_browser_1.bindingsStreamToGraphQl; } });
const QueryDynamic_1 = require("./lib/QueryDynamic");
/**
 * Create a new dynamic comunica engine from a given config file.
 * @param {IQueryOptions} options Optional options on how to instantiate the query evaluator.
 * @return {Promise<QueryEngine>} A promise that resolves to a fully wired comunica engine.
 */
function newEngineDynamic(options) {
    return QueryDynamic_1.newEngineDynamicArged(options || {}, __dirname, `${__dirname}/config/config-default.json`);
}
exports.newEngineDynamic = newEngineDynamic;
//# sourceMappingURL=index.js.map