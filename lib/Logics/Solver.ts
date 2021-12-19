/* eslint-disable max-len */
/**
 * Created by pc on 27/01/2016.
 */

import type { Quad, Term } from '@rdfjs/types';
import { quad, blankNode } from '@rdfjs/data-model';
import { Rule } from './Rule';

/**
* Evaluates a set of rules over a set of facts.
* @param rs
* @param facts
* @returns Array of the evaluation.
*/
export async function evaluateRuleSet(rules: Rule[], quads: Quad[]): Promise<Quad[]> {
  const promises = rules.map((rule) => evaluateThroughRestriction(rule, quads));
  return [].concat(...await Promise.all(promises));
}

/**
* Evaluates a rule over a set of facts through
* restriction of the rule's causes.
* @param rule
* @param facts
* @returns {Array}
*/
export async function evaluateThroughRestriction(rule: Rule, quads: Quad[]): Promise<Quad[]> {
  return getMappings(rule, quads).flatMap((mapping) => {
    if (!rule.conclusion) {
      throw new Error('Inconsistent database');
    }
    return rule.conclusion.map((q) => substituteFactVariables(mapping, q));
  })
}

export function getMappings(rule: Rule, quads: Quad[]) {
  let currentCauses = [{
    cause: rule.premise[0],
    mapping: {},
  }]

  for (const nextCause of rule.premise.slice(1)) {
    const newCauses = []
    for (const currentCause of currentCauses) {
      // const facts = dataset.match(currentCause.cause.subject, currentCause.cause.predicate, currentCause.cause.object, currentCause.cause.graph);
  
      for (const q of quads) {
        const mapping = factMatches(q, currentCause.cause, currentCause.mapping);
        if (mapping) {
          newCauses.push({
            cause: substituteFactVariables(mapping, nextCause),
            mapping,
          });
        }
      }
    }

    currentCauses = newCauses
  }

  return currentCauses.map((c) => c.mapping);
}

/**
* Returns a new or updated mapping if a fact matches a rule cause or consequence,
* return false otherwise.
* @param fact
* @param ruleFact
* @param mapping
* @returns {*}
*/
export function factMatches(fact: Quad, term: Quad, mapping: { [key: string]: Term }) {
  const localMapping = {};

  function factElemMatches(factElem: Term, causeElem: Term) {
    if (causeElem.termType === 'Variable') {
      if (mapping[causeElem.value] && !(mapping[causeElem.value].equals(factElem))) return false;
      localMapping[causeElem.value] = factElem;
    }
    return factElem.equals(causeElem);
  }

  // Checks and update localMapping if matches
  if (!factElemMatches(fact.predicate, term.predicate)
  || !factElemMatches(fact.object, term.object)
  || !factElemMatches(fact.subject, term.subject)) return false;

  // If an already existing uri has been mapped...
  // Merges local and global mapping
  for (const mapKey in mapping) {
    for (const key in localMapping) {
      // This is horribly innefficient, allow lookup in rev direction
      if (mapping[mapKey] === localMapping[key] && mapKey !== key) return false;
    }
    localMapping[mapKey] = mapping[mapKey];
  }

  // The new mapping is updated
  return localMapping;
}

/**
* Substitutes an element given the mapping.
* @param elem
* @param mapping
* @returns {*}
*/
export function substitute(elem: Term, mapping: { [key: string]: Term }): Term {
  // TODO: See if this is necessary
  if (elem.termType === 'BlankNode') return blankNode();
  if (elem.termType === 'Variable') {
    if (!(elem.value in mapping)) {
      throw new Error('Variable not found in mapping');
    }
    return mapping[elem.value];
  }
  return elem;
}

export function substituteFactVariables(mapping: { [key: string]: Term }, term: Quad) {
  return quad(
    // @ts-ignore
    substitute(term.subject, mapping),
    substitute(term.predicate, mapping),
    substitute(term.object, mapping),
    term.graph // TODO: Double check this
  );
}
