/**
 * Created by pc on 27/01/2016.
 */

import Fact from './Fact'

import * as Logics from './Logics.js'
import * as Utils from '../Utils'
import emitter from '../Emitter'
import q from 'q'

/**
 * Core solver used to evaluate rules against facts
 * using pattern matching mechanisms.
 */

/**
 * Evaluates a set of rules over a set of facts.
 * @param rs
 * @param facts
 * @returns Array of the evaluation.
 */
export function evaluateRuleSet (rs, facts, doTagging = false) {
  const deferred = q.defer()
  const promises = []
  let cons = []
  for (const key in rs) {
    if (doTagging) {
      promises.push(evaluateThroughRestrictionWithTagging(rs[key], facts))
    } else {
      promises.push(evaluateThroughRestriction(rs[key], facts))
    }
  }
  try {
    q.all(promises).then(function (consTab) {
      for (let i = 0; i < consTab.length; i++) {
        cons = cons.concat(consTab[i])
      }
      deferred.resolve({ cons: cons })
    })
  } catch (e) {
    deferred.reject(e)
  }
  return deferred.promise
}

/**
 * Evaluates a rule over a set of facts through
 * restriction of the rule's causes.
 * @param rule
 * @param facts
 * @returns {Array}
 */
export function evaluateThroughRestriction (rule, facts) {
  const mappingList = getMappings(rule, facts); const consequences = []; const deferred = q.defer()

  try {
    checkOperators(rule, mappingList)

    for (let i = 0; i < mappingList.length; i++) {
      if (mappingList[i]) {
        // Replace mappings on all consequences
        for (let j = 0; j < rule.consequences.length; j++) {
          consequences.push(substituteFactVariables(mappingList[i], rule.consequences[j], [], rule))
        }
      }
    }
    deferred.resolve(consequences)
  } catch (e) {
    deferred.reject(e)
  }

  return deferred.promise
}

/**
 * Evaluates a rule over a set of facts through
 * restriction of the rule's causes with tagging.
 * @param rule
 * @param kb
 * @returns {Array}
 */
export function evaluateThroughRestrictionWithTagging (rule, kb) {
  const mappingList = getMappings(rule, kb)
  const deferred = q.defer()
  const consequences = []
  let consequence
  let causes
  let iterationConsequences

  checkOperators(rule, mappingList)

  try {
    for (let i = 0; i < mappingList.length; i++) {
      if (mappingList[i]) {
        // Replace mappings on all consequences
        causes = Logics.buildCauses(mappingList[i].__facts__)
        iterationConsequences = []
        for (let j = 0; j < rule.consequences.length; j++) {
          consequence = substituteFactVariables(mappingList[i], rule.consequences[j], causes, rule)
          consequences.push(consequence)
          iterationConsequences.push(consequence)
        }
        try {
          Logics.addConsequences(mappingList[i].__facts__, iterationConsequences)
        } catch (e) {
          throw 'Error when trying to add consequences on the implicit fact.'
        }
      }
    }
    deferred.resolve(consequences)
  } catch (e) {
    deferred.reject(e)
  }

  return deferred.promise
}

export function checkOperators (rule, mappingList) {
  const causes = rule.operatorCauses
  let operationToEvaluate
  let substitutedFact

  if (rule.operatorCauses.length == 0) return mappingList

  for (let i = 0; i < mappingList.length; i++) {
    for (let j = 0; j < causes.length; j++) {
      // @ts-ignore
      substitutedFact = substituteFactVariables(mappingList[i], causes[j])
      try {
        operationToEvaluate = Utils.getValueFromDatatype(substitutedFact.subject) +
          substitutedFact.predicate +
          Utils.getValueFromDatatype(substitutedFact.object)
      } catch (e) {
        throw e
      }
      if (!eval(operationToEvaluate)) {
        delete mappingList[i]
        break
      }
    }
  }
}

export function getMappings (rule, facts) {
  let i = 0; let mappingList

  mappingList = [rule.causes[i]] // Init with first cause

  while (i < rule.causes.length) {
    mappingList = substituteNextCauses(mappingList, rule.causes[i + 1], facts, rule.constants, rule)
    i++
  }
  return mappingList
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
export function substituteNextCauses (currentCauses, nextCause, facts, constants, rule) {
  const substitutedNextCauses = []; const mappings = []

  for (let i = 0; i < currentCauses.length; i++) {
    for (let j = 0; j < facts.length; j++) {
      // Get the mapping of the current cause ...
      let mapping = currentCauses[i].mapping; let substitutedNextCause; let newMapping
      // ... or build a fresh one if it does not exist
      if (mapping === undefined) {
        mapping = {}
        mapping.__facts__ = []
      }

      // Update the mapping using pattern matching
      newMapping = factMatches(facts[j], currentCauses[i], mapping, constants, rule)

      // If the current fact matches the current cause ...
      if (newMapping) {
        // If there are other causes to be checked...
        if (nextCause) {
          // Substitute the next cause's variable with the new mapping
          substitutedNextCause = substituteFactVariables(newMapping, nextCause, [], rule)
          substitutedNextCause.mapping = newMapping
          substitutedNextCauses.push(substitutedNextCause)
        } else {
          // Otherwise, add the new mapping to the global mapping array
          mappings.push(newMapping)
        }
      }
    }
  }

  if (nextCause) {
    return substitutedNextCauses
  } else {
    return mappings
  }
}

/**
 * Returns a new or updated mapping if a fact matches a rule cause or consequence,
 * return false otherwise.
 * @param fact
 * @param ruleFact
 * @param mapping
 * @returns {*}
 */
export function factMatches (fact, { predicate, object, subject }, mapping, constants, { name }) {
  const localMapping = {}

  // Checks and update localMapping if matches
  if (!factElemMatches(fact.predicate, predicate, mapping, localMapping)) {
    return false
  }
  if (!factElemMatches(fact.object, object, mapping, localMapping)) {
    return false
  }
  if (!factElemMatches(fact.subject, subject, mapping, localMapping)) {
    return false
  }

  emitter.emit('rule-fired', name)

  // If an already existing uri has been mapped...
  /* for (var key in localMapping) {
      if(constants.indexOf(localMapping[key]) !== -1) {
          return false;
      }
  } */

  // Merges local and global mapping
  for (const mapKey in mapping) {
    if (mapKey == '__facts__') {
      localMapping[mapKey] = Utils.uniques(mapping[mapKey], [fact])
    } else {
      for (const key in localMapping) {
        if (mapping[mapKey] == localMapping[key]) {
          if (mapKey != key) {
            return false
          }
        }
      }
      localMapping[mapKey] = mapping[mapKey]
    }
  }

  // The new mapping is updated
  return localMapping
}

export function factElemMatches (factElem, causeElem, globalMapping, localMapping) {
  if (causeElem.indexOf('?') === 0) {
    if (globalMapping[causeElem] && (globalMapping[causeElem] != factElem)) {
      return false
    } else {
      localMapping[causeElem] = factElem
    }
  } else {
    if (factElem != causeElem) {
      return false
    }
  }

  return true
}

/**
 * Substitutes an element given the mapping.
 * @param elem
 * @param mapping
 * @returns {*}
 */
export function substituteElementVariablesWithMapping (elem, mapping) {
  if (Logics.isBNode(elem)) {
    return Logics.skolemize(mapping.__facts__, elem)
  } else if (Logics.isVariable(elem)) {
    if (mapping[elem] !== undefined) {
      return mapping[elem]
    }
  }
  return elem
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
export function substituteFactVariables (mapping, notYetSubstitutedFact, causedBy, rule) {
  let subject, predicate, object, substitutedFact
  if (mapping == {}) {
    return notYetSubstitutedFact
  }
  subject = substituteElementVariablesWithMapping(notYetSubstitutedFact.subject, mapping)
  predicate = substituteElementVariablesWithMapping(notYetSubstitutedFact.predicate, mapping)
  object = substituteElementVariablesWithMapping(notYetSubstitutedFact.object, mapping)
  // @ts-ignore
  substitutedFact = new Fact(predicate, subject, object, [], false)

  if (causedBy) {
    substitutedFact.causedBy = causedBy
    substitutedFact.explicit = false
  }

  if (rule) {
    substitutedFact.rule = rule
  }

  return substitutedFact
}
