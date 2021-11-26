/* eslint-disable no-use-before-define */
/**
 * Created by MT on 11/09/2015.
 * Logics module
 */

import md5 from 'md5';
import Rule from './Rule';

import Fact from './Fact';
import * as Utils from '../Utils';
import * as Errors from '../Errors';
import RegularExpr from '../RegularExpressions';
import Prefixes from '../Prefixes';

/**
 * All necessary stuff around the Logics module
 * @type {{substractFactSets: Function, mergeFactSets: Function}}
 */

/**
 * True-like merge of two facts sets, which also merges
 * identical facts causedBy properties.
 * @param fs1
 * @param fs2
 */
export function combine(fs, subset) {
  for (const fact of fs) {
    for (let j = 0; j < subset.length; j++) {
      if ((subset[j] !== undefined) && (fact.equivalentTo(subset[j]))) {
        fact.causedBy = uniquesCausedBy(fact.causedBy, subset[j].causedBy);
        fact.consequences = fact.consequences.concat(subset[j].consequences);
        subset[j].doPropagate(fact);
        delete subset[j];
      }
    }
  }
  for (const fact of subset) {
    if (fact !== undefined) fs.push(fact);
  }
}

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
export function similarAtoms(atom1, atom2) {
  return (isVariable(atom1) && isVariable(atom2))
    || atom1 === atom2;
}

/**
 * Checks if a set of facts is a subset of another set of facts.
 * @param fs1 the superset
 * @param fs2 the potential subset
 */
export function containsFacts(fs1, fs2) {
  if (!fs2 || (fs2.length > fs1.length)) return false;
  for (const key in fs2) {
    const fact = fs2[key];
    if (!(fact.appearsIn(fs1))) {
      return false;
    }
  }
  return true;
}

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

export function updateValidTags(kb, additions, deletions) {
  const newAdditions = [];
  const resolvedAdditions = [];
  const kbMap = kb.map((x) => x.toRaw());
  let index;
  for (const addition of additions) {
    index = kbMap.includes(addition.toRaw());
    if (index !== -1) {
      if (kb[index].explicit) {
        kb[index].valid = true;
      } else {
        addAlternativeDerivationAsCausedByFromExplicit(kb, kb[index], addition);
        resolvedAdditions.push(addition);
      }
    } else {
      newAdditions.push(addition);
    }
  }

  for (const deletion of deletions) {
    index = kbMap.indexOf(deletion.toRaw());
    if (index !== -1 && kb[index].explicit) {
      kb[index].valid = false;
    }
  }

  return {
    new: newAdditions,
    resolved: resolvedAdditions,
  };
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
  let conjunction;
  const disjunction = [];

  if ((prev === []) || (next === [])) {
    throw Errors.OrphanImplicitFact();
  }

  for (let i = 0; i < prev.length; i++) {
    conjunction = prev[i];
    for (let j = 0; j < next.length; j++) {
      disjunction.push(Utils.uniques(conjunction, next[j]));
    }
  }
  return disjunction;
}

export function unifyFactSet(fs) {
  const unifiedSet = [];
  let foundFactIndex;
  for (let i = 0; i < fs.length; i++) {
    if (fs[i] !== undefined) {
      // eslint-disable-next-line no-cond-assign
      if (foundFactIndex = fs[i].appearsIn(unifiedSet)) {
        unifiedSet[foundFactIndex].causedBy = this.uniquesCausedBy(
          fs[i].causedBy,
          unifiedSet[foundFactIndex].causedBy,
        );
        unifiedSet[foundFactIndex].consequences = Utils.uniques(
          fs[i].consequences,
          unifiedSet[foundFactIndex].consequences,
        );
        fs[i].doPropagate(unifiedSet[foundFactIndex]);
      } else {
        unifiedSet.push(fs[i]);
      }
    }
  }
  return unifiedSet;
}

export function unify(subSet, updatingSet) {
  const initialLength = updatingSet.length;

  subSet = unifyFactSet(subSet);
  combine(updatingSet, subSet);
  return initialLength < updatingSet.length;
}

export function uniquesCausedBy(cb1, cb2) {
  let min; let max; const newCb = []; let found;

  if (cb1.length >= cb2.length) {
    min = cb2;
    max = cb1;
  } else {
    min = cb1;
    max = cb2;
  }

  for (let i = 0; i < max.length; i++) {
    found = false;
    for (let j = 0; j < min.length; j++) {
      if (this.containsFacts(min[j], max[i])) {
        found = true;
        if (min.length !== max.length) {
          min[j] = max[i];
        }
        break;
      }
    }

    if (!found) {
      newCb.push(max[i]);
    }
  }

  return newCb.concat(min.slice());
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
  const bodyTriples = strRule.split('->')[1].match(RegularExpr.TRIPLE);
  const headTriples = strRule.split('->')[0].match(RegularExpr.TRIPLE);

  const causes = _createFactSetFromTriples(headTriples);
  const consequences = _createFactSetFromTriples(bodyTriples);

  return new Rule(causes, consequences, name, entailment);
}

export function _createFactSetFromTriples(triples) {
  const set: Fact[] = [];
  if (triples[0] === 'false') {
    set.push(new Fact('FALSE'));
  } else {
    for (let i = 0; i < triples.length; i++) {
      const atoms = [];

      for (let atom of triples[i].match(RegularExpr.ATOM).splice(1)) {
        if (atom.match(RegularExpr.PREFIXED_URI)) {
          atom = Prefixes.replacePrefixWithUri(atom, atom.match(RegularExpr.PREFIXED_URI)[1]);
        }
        atoms.push(atom);
      }

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
