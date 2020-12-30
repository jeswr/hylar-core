/**
* Created by Spadon on 17/10/2014.
*/
import * as ReasoningEngine from './ReasoningEngine';
/**
 * The core reasoner or HyLAR.
 */
export declare function updateRuleDependencies(ruleSet: any): void;
/**
 * Evaluates knowledge base update using
 * advanced reasoning algorithms (incremental, tag-based).
 * @param fI The facts to insert
 * @param fD The facts to delete
 * @param F The KB
 * @param alg The reasoning algorithm (function)
 * @returns {*}
 */
export declare function evaluate(fI: any, fD: any, F: any, alg: any, rules: any): any;
/**
 * Specifies the reasoning engine used.
 */
export declare const engine: typeof ReasoningEngine;
/**
 * Specifies the behavior of the reasoning engine
 * (algorithm currently chosen).
 */
export declare const process: {
    it: {
        none: any;
        incrementally: typeof ReasoningEngine.incremental;
        tagBased: typeof ReasoningEngine.tagging;
    };
};
