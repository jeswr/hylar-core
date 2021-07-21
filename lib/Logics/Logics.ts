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
 * Returns implicit facts from the set.
 * @param fs
 * @returns {Array}
 */
export function getOnlyImplicitFacts(fs) {
  const fR = [];
  for (const key in fs) {
    const fact = fs[key];
    if (!fact.explicit) {
      fR.push(fact);
    }
  }
  return fR;
}

/**
 * Returns explicit facts from the set.
 * @param fs
 * @returns {Array}
 */
export function getOnlyExplicitFacts(fs: { [key: string]: Fact }): Fact[] {
  const fR: Fact[] = [];
  for (const key in fs) {
    const fact = fs[key];
    if (fact.explicit) {
      fR.push(fact);
    }
  }
  return fR;
}

/**
 * Returns a restricted rule set,
 * in which at least one fact from the fact set
 * matches all rules.
 * @param rs
 * @param fs
 * @returns {Array}
 */
export function restrictRuleSet(rs, fs) {
  const restriction = [];

  for (const rule of rs) {
    let matches = false;

    for (const cause of rule.causes) {
      for (const fact of fs) {
        if (causeMatchesFact(cause, fact)) {
          matches = true;
          break;
        }
      }

      if (matches) {
        restriction.push(rule);
        break;
      }
    }
  }

  return restriction;
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
 * Return true if the two atoms are either both variables, or
 * identical URIs.
 * @returns {boolean}
 */
// export function similarAtoms(atom1, atom2) {
//   return (isVariable(atom1) && isVariable(atom2))
//     || atom1 === atom2;
// }

/**
 * Substracts each set.
 * Not to be used in tag-based reasoning.
 * @param _set1
 * @param _set2
 * @returns {Array}
 */
export function minus(_set1, _set2) {
  let flagEquals;
  const newSet = [];
  for (let i = 0; i < _set1.length; i++) {
    flagEquals = false;
    for (let j = 0; j < _set2.length; j++) {
      if (_set1[i].asString === _set2[j].asString) {
        flagEquals = true;
        break;
      }
    }
    if (!flagEquals) {
      newSet.push(_set1[i]);
    }
  }

  return newSet;
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

export function buildCauses(conjunction) {
  const explicitFacts = getOnlyExplicitFacts(conjunction);
  const implicitFacts = getOnlyImplicitFacts(conjunction);
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
  for (let i = 0; i < facts.length; i++) {
    if (!facts[i].explicit) {
      facts[i].consequences = facts[i].consequences.concat(consequences);
      for (let j = 0; j < consequences.length; j++) {
        consequences[j].__propagate__ = facts[i];
      }
    }
  }
}

export function combineImplicitCauses(implicitFacts) {
  let combination = implicitFacts[0].causedBy;
  for (let i = 1; i < implicitFacts.length; i++) {
    combination = this.disjunctCauses(combination, implicitFacts[i].causedBy);
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
  const parsedRuleList: Rule[] = [];
  for (let i = 0; i < strRuleList.length; i++) {
    const match = strRuleList[i].match('(.+)=(.+)');
    if (match) {
      parsedRuleList.push(parseRule(match[2], match[1], entailment));
    } else {
      parsedRuleList.push(parseRule(strRuleList[i], null, entailment));
    }
  }
  return parsedRuleList;
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
