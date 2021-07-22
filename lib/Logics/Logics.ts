/* eslint-disable no-use-before-define */
/**
 * Created by MT on 11/09/2015.
 * Logics module
 */

import md5 from 'md5';
import Rule from './Rule';

import Fact from './Fact';
import * as Utils from '../Utils';
import * as RegularExpressions from '../RegularExpressions';
import * as Prefixes from '../Prefixes';

/**
 * All necessary stuff around the Logics module
 * @type {{substractFactSets: Function, mergeFactSets: Function}}
 */

/**
 * Returns a restricted rule set,
 * in which at least one fact from the fact set
 * matches all rules.
 * @param rs
 * @param fs
 * @returns {Array}
 */
export function restrictRuleSet(rs: Rule[], fs: Fact[]) {
  return rs.filter(({ causes }) => causes.some((cause) => fs.some(
    (fact) => causeMatchesFact(cause, fact),
  )));
}

/**
 * Checks if a cause matches a fact, i.e. is the cause's pattern
 * can be satisfied by the fact.
 * @param cause
 * @param fact
 * @returns {*}
 */
export function causeMatchesFact(fact1, fact2) {
  return causeMemberMatchesFactMember(fact1.predicate, fact2.predicate)
    && causeMemberMatchesFactMember(fact1.subject, fact2.subject)
    && causeMemberMatchesFactMember(fact1.object, fact2.object);
}

/**
 * Return true if the cause and fact members (subjects, objects or predicates)
 * are equal (if URI) or if both are variables. Returns false otherwise.
 * @param causeMember
 * @param factMember
 * @returns {boolean}
 */
export function causeMemberMatchesFactMember(causeMember, factMember) {
  return causeMember === factMember || causeMember.indexOf('?') === 0;
}

/**
 * Substracts each set.
 * Not to be used in tag-based reasoning.
 * @param _set1
 * @param _set2
 * @returns {Array}
 */
export function minus(set1: any[], set2: any[]) {
  const hash: Record<string, boolean> = {};
  set2.forEach((fact) => { hash[`${fact}`] = true; });
  return set1.filter((fact) => !(`${fact}` in hash));
}

/**
 * Checks if a string is a variable,
 * @param str
 * @returns {boolean}
 */
export function isVariable(str) {
  try {
    return (str.indexOf('?') === 0);
  } catch (e) {
    return false;
  }
}

export function addAlternativeDerivationAsCausedByFromExplicit(kb, { consequences }, altFact) {
  const derivations = consequences;

  for (let i = 0; i < derivations.length; i++) {
    derivations[i].causedBy = Utils.insertUnique(derivations[i].causedBy, [altFact]);
    for (let j = 0; j < derivations[i].consequences.length; j++) {
      addAlternativeDerivationAsCausedByFromExplicit(kb, derivations[i].consequences[j], altFact);
    }
  }
}

export function buildCauses(conjunction: Fact[]) {
  const explicitFacts = conjunction.filter((fact) => fact.explicit);
  const implicitFacts = conjunction.filter((fact) => !fact.explicit);
  let combinedImplicitCauses;
  const builtCauses = [];

  if (implicitFacts.length > 0) {
    combinedImplicitCauses = combineImplicitCauses(implicitFacts);
    if (explicitFacts.length > 0) {
      for (let i = 0; i < combinedImplicitCauses.length; i++) {
        for (let j = 0; j < explicitFacts.length; j++) {
          builtCauses.push(Utils.insertUnique(combinedImplicitCauses[i], explicitFacts[j]));
        }
      }
      return builtCauses;
    }
    return combinedImplicitCauses;
  }
  return [conjunction];
}

export function addConsequences(facts, consequences) {
  for (const fact of facts) {
    if (!fact.explicit) {
      fact.consequences = fact.consequences.concat(consequences);
      for (const consequence of consequences) {
        consequence.__propagate__ = fact;
      }
    }
  }
}

export function combineImplicitCauses(implicitFacts) {
  let combination = implicitFacts[0].causedBy;
  for (const { causedBy } of implicitFacts) {
    combination = this.disjunctCauses(combination, causedBy);
  }
  return combination;
}

export function disjunctCauses(prev, next) {
  if ((prev === []) || (next === [])) {
    throw new Error('Implicit facts could not have empty causes.');
  }

  const disjunction = [];
  for (const conjunction of prev) {
    for (const n of next) {
      disjunction.push(Utils.uniques(conjunction, n));
    }
  }
  return disjunction;
}

export function parseRules(strRuleList: string[], entailment = Rule.types.CUSTOM): Rule[] {
  return strRuleList.map((rule) => {
    const match = rule.match('(.+)=(.+)');
    return match ? parseRule(match[2], match[1], entailment) : parseRule(rule, null, entailment);
  });
}

export function parseRule(strRule, name = `rule-${md5(strRule)}`, entailment) {
  const bodyTriples = strRule.split('->')[1].match(RegularExpressions.TRIPLE);
  const headTriples = strRule.split('->')[0].match(RegularExpressions.TRIPLE);

  return new Rule(
    _createFactSetFromTriples(headTriples),
    _createFactSetFromTriples(bodyTriples), name, entailment,
  );
}

export function _createFactSetFromTriples(triples) {
  const set: Fact[] = [];
  if (triples[0] === 'false') {
    set.push(new Fact(false));
  } else {
    for (const triple of triples) {
      const atoms = triple.match(RegularExpressions.ATOM).splice(1).map(
        (atom) => (atom.match(RegularExpressions.PREFIXED_URI)
          ? Prefixes.replacePrefixWithUri(
            atom, atom.match(RegularExpressions.PREFIXED_URI)[1],
          ) : atom),
      );

      set.push(new Fact(atoms[1], atoms[0], atoms[2]));
    }
  }
  return set;
}

export function isBNode(elem) {
  return ((elem !== undefined) && (elem.indexOf('__bnode__') === 0));
}

export function skolemize(facts, elem) {
  let skolem = '';
  for (let i = 0; i < facts.length; i++) {
    skolem += facts[i].asString;
  }
  return md5(skolem) + elem;
}
