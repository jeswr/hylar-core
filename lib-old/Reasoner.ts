/**
* Created by Spadon on 17/10/2014.
*/

import * as ReasoningEngine from './ReasoningEngine'

/**
 * The core reasoner or HyLAR.
 */

export function updateRuleDependencies (ruleSet) {
  for (const rule of ruleSet) {
    for (const depRule of ruleSet) {
      if (rule.dependsOn(depRule)) {
        depRule.addDependentRule(rule)
      }
    }
  }
}

/**
 * Evaluates knowledge base update using
 * advanced reasoning algorithms (incremental, tag-based).
 * @param fI The facts to insert
 * @param fD The facts to delete
 * @param F The KB
 * @param alg The reasoning algorithm (function)
 * @returns {*}
 */
export function evaluate (fI, fD, F, alg, rules) {
  if (!alg) alg = ReasoningEngine.incremental
  return alg(fI, fD, F, rules)
}

/**
 * Specifies the reasoning engine used.
 */
export const engine = ReasoningEngine

/**
 * Specifies the behavior of the reasoning engine
 * (algorithm currently chosen).
 */
export const process = {
  it: {
    none: null,
    incrementally: ReasoningEngine.incremental,
    tagBased: ReasoningEngine.tagging
  }
}
