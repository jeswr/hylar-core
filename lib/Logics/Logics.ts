import md5 from 'md5';
import type { BaseQuad, Quad, Term, DatasetCore } from 'rdf-js';
import { stringToTerm } from 'rdf-string-ttl';
import Rule from './Rule';

import Fact from './Fact';
import * as Utils from '../Utils';
import * as RegularExpressions from '../RegularExpressions';

function restrictRule(rules: Rule[], source: DatasetCore) {
  rules.filter(({ causes }) => causes.some(({ quad }) => quad && source.has(quad)));
}

/**
 * Returns a restricted rule set,
 * in which at least one fact from the fact set
 * matches all rules.
 * @param rs
 * @param fs
 * @returns {Array}
 */
export function restrictRuleSet(rs: Rule[], fs: IterableIterator<Fact> | Fact[]) {
  return rs.filter(({ causes }) => causes.some((cause) => {
    for (const fact of fs) {
      if (cause.quad && fact.quad && matchQuad(cause.quad, fact.quad)) return true;
    }
    return false;
  }));
}

/**
 * Checks if a cause matches a fact, i.e. is the cause's pattern
 * can be satisfied by the fact.
 * @param cause
 * @param fact
 * @returns {*}
 */
export function matchQuad(q1: BaseQuad, q2: BaseQuad) {
  return match(q1.predicate, q2.predicate) && match(q1.subject, q2.subject) && match(q1.object, q2.object);
}

/**
 * Return true if the cause and fact members (subjects, objects or predicates)
 * are equal (if URI) or if both are variables. Returns false otherwise.
 * @param causeMember
 * @param factMember
 * @returns {boolean}
 */
export function match(causeMember: Term, factMember: Term) {
  return causeMember.equals(factMember) || causeMember.termType === 'Variable';
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

export function buildCauses(conjunction: Fact[]) {
  const explicitFacts = conjunction.filter((fact) => fact.explicit);
  const implicitFacts = conjunction.filter((fact) => !fact.explicit);

  if (implicitFacts.length === 0) return [conjunction];

  const combinedImplicitCauses = combineImplicitCauses(implicitFacts);
  if (explicitFacts.length === 0) return combinedImplicitCauses;

  const builtCauses: Fact[] = [];
  for (const implicitCause of combinedImplicitCauses) {
    for (const explicitFact of explicitFacts) {
      builtCauses.push(Utils.insertUnique(implicitCause, explicitFact));
    }
  }
  return builtCauses;
}

export function addConsequences(facts: Fact[], consequences: Fact[]) {
  for (const fact of facts) {
    if (!fact.explicit) {
      fact.consequences = fact.consequences.concat(consequences);
    }
  }
}

export function combineImplicitCauses(implicitFacts) {
  let combination = implicitFacts[0].causedBy;
  // TODO; double check this shouldn't start from 1
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

export function parseRules(strRuleList: string[]): Rule[] {
  return strRuleList.map((rule) => parseRule(rule.match('(.+)=(.+)')?.[2] ?? rule));
}

export function parseRule(strRule: string) {
  const [head, body] = strRule.split('->');
  return new Rule(
    _createFactSetFromTriples(head.match(RegularExpressions.TRIPLE)),
    _createFactSetFromTriples(body.match(RegularExpressions.TRIPLE)),
  );
}

export function _createFactSetFromTriples(triples: string[]) {
  if (triples[0] === 'false') return [new Fact(false)];
  return triples.map((triple) => {
    const term = stringToTerm(triple);
    if (term.termType !== 'Quad') throw new Error('Triple expected when parsing rules');
    return new Fact(term);
  });
}

export function skolemize(facts: Fact[], { value }: Term) {
  return md5(facts.reduce((str, fact) => `${str}${fact}`, '')) + value;
}
