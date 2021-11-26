/* eslint-disable max-len */
/**
 * Created by pc on 27/01/2016.
 */

import type { Quad, Term } from 'rdf-js';
import { quad } from '@rdfjs/data-model';
import Fact from './Fact';
import * as Logics from './Logics';
import * as Utils from '../Utils';
import Rule from './Rule';

/**
* Core solver used to evaluate rules against facts
* using pattern matching mechanisms.
* /

/**
* Evaluates a set of rules over a set of facts.
* @param rs
* @param facts
* @returns Array of the evaluation.
*/
export async function evaluateRuleSet(rules: Rule[], facts: Fact[] | IterableIterator<Fact>, doTagging = false): Promise<Fact[]> {
  const evaluate = doTagging ? evaluateThroughRestrictionWithTagging : evaluateThroughRestriction;
  const promises = rules.map((rule) => evaluate(rule, facts));

  return [].concat(...await Promise.all(promises));
}

/**
* Evaluates a rule over a set of facts through
* restriction of the rule's causes.
* @param rule
* @param facts
* @returns {Array}
*/
export async function evaluateThroughRestriction(rule: Rule, facts: Fact[] | IterableIterator<Fact>): Promise<Fact> {
  const mappingList = getMappings(rule, facts); const consequences = [];

  checkOperators(rule, mappingList);
  for (const mapping of mappingList) {
    if (mapping) {
      // Replace mappings on all consequences
      for (const r of rule.consequences) {
        consequences.push(substituteFactVariables(mapping, r, []));
      }
    }
  }
  return consequences;
}

/**
* Evaluates a rule over a set of facts through
* restriction of the rule's causes with tagging.
* @param rule
* @param kb
* @returns {Array}
*/
export function evaluateThroughRestrictionWithTagging(rule: Rule, kb: Fact[] | IterableIterator<Fact>) {
  const mappingList = getMappings(rule, kb);
  const consequences: Fact[] = [];

  checkOperators(rule, mappingList);

  for (let i = 0; i < mappingList.length; i++) {
    if (mappingList[i]) {
      // Replace mappings on all consequences
      const iterationConsequences = [];
      for (let j = 0; j < rule.consequences.length; j++) {
        const consequence = substituteFactVariables(mappingList[i], rule.consequences[j], Logics.buildCauses(mappingList[i].__facts__));
        consequences.push(consequence);
        iterationConsequences.push(consequence);
      }
      try {
        Logics.addConsequences(mappingList[i].__facts__, iterationConsequences);
      } catch (e) {
        throw new Error('Error when trying to add consequences on the implicit fact.');
      }
    }
  }
  return consequences;
}

// eslint-disable-next-line consistent-return
export function checkOperators(rule, mappingList) {
  const causes = rule.operatorCauses;
  let operationToEvaluate;
  let substitutedFact;

  if (rule.operatorCauses.length === 0) return mappingList;

  for (let i = 0; i < mappingList.length; i++) {
    for (let j = 0; j < causes.length; j++) {
      // @ts-ignore
      substitutedFact = substituteFactVariables(mappingList[i], causes[j]);
      operationToEvaluate = Utils.getValueFromDatatype(substitutedFact.subject)
        + substitutedFact.predicate
        + Utils.getValueFromDatatype(substitutedFact.object);
    }
    // TODO: REMOVE EVAL
    // eslint-disable-next-line no-eval
    if (!eval(operationToEvaluate)) {
      delete mappingList[i];
      break;
    }
  }
}

export function getMappings(rule: Rule, facts: Fact[] | IterableIterator<Fact>) {
  let mappingList = [rule.causes[0]]; // Init with first cause

  for (let i = 0; i < rule.causes.length; i++) {
    mappingList = substituteNextCauses(mappingList, rule.causes[i + 1], facts);
  }
  return mappingList;
}

/**
* Updates the mapping of the current cause
* given the next cause of a rule, over a
* set of facts.
* @param currentCauses
* @param nextCause
* @param facts
* @returns {Array}
*/
export function substituteNextCauses(currentCauses: Fact[], nextCause: Fact, facts: Fact[] | IterableIterator<Fact>) {
  const substitutedNextCauses = []; const mappings = [];

  for (const currentCause of currentCauses) {
    for (const fact of facts) {
      // Update the mapping using pattern matching
      const newMapping = factMatches(fact, currentCause, currentCause.mapping ?? { __facts__: [] });

      // If the current fact matches the current cause ...
      if (newMapping) {
        // If there are other causes to be checked...
        if (nextCause) {
          // Substitute the next cause's variable with the new mapping
          substitutedNextCause = substituteFactVariables(newMapping, nextCause, []);
          substitutedNextCause.mapping = newMapping;
          substitutedNextCauses.push(substitutedNextCause);
        } else {
          // Otherwise, add the new mapping to the global mapping array
          mappings.push(newMapping);
        }
      }
    }
  }
  return nextCause ? substitutedNextCauses : mappings;
}

/**
* Returns a new or updated mapping if a fact matches a rule cause or consequence,
* return false otherwise.
* @param fact
* @param ruleFact
* @param mapping
* @returns {*}
*/
export function factMatches(fact: Fact, { quad: term }: Fact, mapping) {
  const localMapping = {};

  // Checks and update localMapping if matches
  if (!term || !fact.quad || !factElemMatches(fact.quad.predicate, term.predicate, mapping, localMapping)
  || !factElemMatches(fact.quad.object, term.object, mapping, localMapping)
  || !factElemMatches(fact.quad.subject, term.subject, mapping, localMapping)) return false;

  // If an already existing uri has been mapped...
  // Merges local and global mapping
  for (const mapKey in mapping) {
    if (mapKey === '__facts__') {
      localMapping[mapKey] = Utils.uniques(mapping[mapKey], [fact]);
    } else {
      for (const key in localMapping) {
        if (mapping[mapKey] === localMapping[key] && mapKey !== key) return false;
      }
      localMapping[mapKey] = mapping[mapKey];
    }
  }

  // The new mapping is updated
  return localMapping;
}

export function factElemMatches(factElem: Term, causeElem: Term, globalMapping, localMapping) {
  if (causeElem.termType === 'Variable') {
    if (globalMapping[causeElem.value] && !(globalMapping[causeElem.value].equals(factElem))) return false;
    localMapping[causeElem.value] = factElem;
  }
  return factElem.equals(causeElem);
}

/**
* Substitutes an element given the mapping.
* @param elem
* @param mapping
* @returns {*}
*/
export function substitute(elem: Term, mapping) {
  if (elem.termType === 'BlankNode') return Logics.skolemize(mapping.__facts__, elem);
  if (elem.termType === 'Variable' && elem.value in mapping) return mapping[elem.value];
  return elem;
}

/**
* Substitutes fact's variable members (sub, pred, obj)
* given the mapping.
* @param mapping
* @param notYetSubstitutedFact
* @param causedBy
* @returns {*}
*/
export function substituteFactVariables(mapping, notYetSubstitutedFact: Fact, causedBy: Fact[][]) {
  const { quad: term } = notYetSubstitutedFact;
  if (mapping === {} || !term) return notYetSubstitutedFact;
  return new Fact(
    quad<Quad>(
      substitute(term.subject, mapping),
      substitute(term.predicate, mapping),
      substitute(term.object, mapping),
    ), !causedBy, causedBy,
  );
}
