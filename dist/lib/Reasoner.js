"use strict";
/**
* Created by Spadon on 17/10/2014.
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = exports.engine = exports.evaluate = exports.updateRuleDependencies = void 0;
const ReasoningEngine = __importStar(require("./ReasoningEngine"));
/**
 * The core reasoner or HyLAR.
 */
function updateRuleDependencies(ruleSet) {
    for (const rule of ruleSet) {
        for (const depRule of ruleSet) {
            if (rule.dependsOn(depRule)) {
                depRule.addDependentRule(rule);
            }
        }
    }
}
exports.updateRuleDependencies = updateRuleDependencies;
/**
 * Evaluates knowledge base update using
 * advanced reasoning algorithms (incremental, tag-based).
 * @param fI The facts to insert
 * @param fD The facts to delete
 * @param F The KB
 * @param alg The reasoning algorithm (function)
 * @returns {*}
 */
function evaluate(fI, fD, F, alg, rules) {
    alg !== null && alg !== void 0 ? alg : (alg = ReasoningEngine.incremental);
    return alg(fI, fD, F, rules);
}
exports.evaluate = evaluate;
/**
 * Specifies the reasoning engine used.
 */
exports.engine = ReasoningEngine;
/**
 * Specifies the behavior of the reasoning engine
 * (algorithm currently chosen).
 */
exports.process = {
    it: {
        none: null,
        incrementally: ReasoningEngine.incremental,
        tagBased: ReasoningEngine.tagging,
    },
};
