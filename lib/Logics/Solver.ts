/**
 * Created by pc on 27/01/2016.
 */

import Fact from './Fact';
import * as Logics from './Logics';
import * as Utils from '../Utils';

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
export async function evaluateRuleSet(rs, facts, doTagging = false) {
  const promises = [];
  for (const key in rs) {
    if (doTagging) {
      promises.push(evaluateThroughRestrictionWithTagging(rs[key], facts));
    } else {
      promises.push(evaluateThroughRestriction(rs[key], facts));
    }
  }
  return { cons: [].concat(...await Promise.all(promises)) };
}

/**
* Evaluates a rule over a set of facts through
* restriction of the rule's causes.
* @param rule
* @param facts
* @returns {Array}
*/
export async function evaluateThroughRestriction(rule, facts) {
  const mappingList = getMappings(rule, facts); const consequences = [];

  checkOperators(rule, mappingList);
  for (const mapping of mappingList) {
    if (mapping) {
      // Replace mappings on all consequences
      for (const r of rule.consequences) {
        consequences.push(substituteFactVariables(mapping, r, [], rule));
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
export function evaluateThroughRestrictionWithTagging(rule, kb) {
  const mappingList = getMappings(rule, kb);
  const consequences = [];
  let consequence;
  let causes;
  let iterationConsequences;

  checkOperators(rule, mappingList);

  for (let i = 0; i < mappingList.length; i++) {
    if (mappingList[i]) {
      // Replace mappings on all consequences
      causes = Logics.buildCauses(mappingList[i].__facts__);
      iterationConsequences = [];
      for (let j = 0; j < rule.consequences.length; j++) {
        consequence = substituteFactVariables(mappingList[i], rule.consequences[j], causes, rule);
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

export function getMappings(rule, facts) {
  let i = 0; let mappingList;

  mappingList = [rule.causes[i]]; // Init with first cause

  while (i < rule.causes.length) {
    mappingList = substituteNextCauses(
      mappingList, rule.causes[i + 1], facts, rule.constants, rule,
    );
    i++;
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
export function substituteNextCauses(currentCauses, nextCause, facts, constants, rule) {
  const substitutedNextCauses = []; const mappings = [];

  for (let i = 0; i < currentCauses.length; i++) {
    for (let j = 0; j < facts.length; j++) {
      // Get the mapping of the current cause ...
      let { mapping } = currentCauses[i]; let substitutedNextCause;
      // ... or build a fresh one if it does not exist
      if (mapping === undefined) {
        mapping = {};
        mapping.__facts__ = [];
      }

      // Update the mapping using pattern matching
      const newMapping = factMatches(facts[j], currentCauses[i], mapping);

      // If the current fact matches the current cause ...
      if (newMapping) {
        // If there are other causes to be checked...
        if (nextCause) {
          // Substitute the next cause's variable with the new mapping
          substitutedNextCause = substituteFactVariables(newMapping, nextCause, [], rule);
          substitutedNextCause.mapping = newMapping;
          substitutedNextCauses.push(substitutedNextCause);
        } else {
          // Otherwise, add the new mapping to the global mapping array
          mappings.push(newMapping);
        }
      }
    }
  }

  if (nextCause) {
    return substitutedNextCauses;
  }
  return mappings;
}

/**
* Returns a new or updated mapping if a fact matches a rule cause or consequence,
* return false otherwise.
* @param fact
* @param ruleFact
* @param mapping
* @returns {*}
*/
export function factMatches(fact, { predicate, object, subject }, mapping) {
  const localMapping = {};

  // Checks and update localMapping if matches
  if (!factElemMatches(fact.predicate, predicate, mapping, localMapping)) {
    return false;
  }
  if (!factElemMatches(fact.object, object, mapping, localMapping)) {
    return false;
  }
  if (!factElemMatches(fact.subject, subject, mapping, localMapping)) {
    return false;
  }

  // If an already existing uri has been mapped...
  // Merges local and global mapping
  for (const mapKey in mapping) {
    if (mapKey === '__facts__') {
      localMapping[mapKey] = Utils.uniques(mapping[mapKey], [fact]);
    } else {
      for (const key in localMapping) {
        if (mapping[mapKey] === localMapping[key]) {
          if (mapKey !== key) {
            return false;
          }
        }
      }
      localMapping[mapKey] = mapping[mapKey];
    }
  }

  // The new mapping is updated
  return localMapping;
}

export function factElemMatches(factElem, causeElem, globalMapping, localMapping) {
  if (causeElem.indexOf('?') === 0) {
    if (globalMapping[causeElem] && (globalMapping[causeElem] !== factElem)) {
      return false;
    }
    localMapping[causeElem] = factElem;
  } else if (factElem !== causeElem) {
    return false;
  }

  return true;
}

/**
* Substitutes an element given the mapping.
* @param elem
* @param mapping
* @returns {*}
*/
export function substituteElementVariablesWithMapping(elem, mapping) {
  if (Logics.isBNode(elem)) {
    return Logics.skolemize(mapping.__facts__, elem);
  } if (Logics.isVariable(elem)) {
    if (mapping[elem] !== undefined) {
      return mapping[elem];
    }
  }
  return elem;
}

/**
* Substitutes fact's variable members (sub, pred, obj)
* given the mapping.
* @param mapping
* @param notYetSubstitutedFact
* @param causedBy
* @param rule
* @returns {*}
*/
export function substituteFactVariables(mapping, notYetSubstitutedFact, causedBy, rule) {
  if (mapping === {}) {
    return notYetSubstitutedFact;
  }
  const subject = substituteElementVariablesWithMapping(notYetSubstitutedFact.subject, mapping);
  const predicate = substituteElementVariablesWithMapping(notYetSubstitutedFact.predicate, mapping);
  const object = substituteElementVariablesWithMapping(notYetSubstitutedFact.object, mapping);
  // @ts-ignore
  const substitutedFact = new Fact(predicate, subject, object, [], false);

  if (causedBy) {
    substitutedFact.causedBy = causedBy;
    substitutedFact.explicit = false;
  }

  if (rule) {
    substitutedFact.rule = rule;
  }

  return substitutedFact;
}
