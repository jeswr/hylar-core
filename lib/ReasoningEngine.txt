import type { Dataset, Quad, Term } from '@rdfjs/types';

// import type { Rule } from './Rule';
// import { evaluateRuleSet } from './Solver';
import type * as RDF from '@rdfjs/types';

interface incrementalInput {
  implicitSource: Dataset,
  explicitSource: Dataset,
  additions: Quad[],
  deletions: Quad[],
  rules: Rule[]
}

interface incrementalOutput {
  implicit: {
    additions: Dataset,
    deletions: Dataset,
  },
  explicit: {
    additions: Dataset,
    deletions: Dataset
  }
}

export async function incremental(input: incrementalInput, output: incrementalOutput): null {
  const allQuads = input.explicitSource.union(input.implicitSource);
  let size: number;


  do {
    size = FiDel.size;
    await evaluateRuleSet(input.rules, allQuads.union(output.explicit.deletions), output.implicit.deletions);
  } while (FiDel.size > size);

  Fe = unionSE(Fe, FeDel); Fi = unionSE(Fi, FiDel); F = union(Fi, Fe);

  do {
    size = FiAdd.size;
    FiAdd = add(
      FiAdd,
      await Solver.evaluateRuleSet(Logics.restrictRuleSet(R, FiDel.values()), F.values()),
    );
  } while (FiAdd.size > size);

  F = unionSE(F, FeAdd);

  do {
    size = 0;
    FiAdd = unionSE(F, FiAdd);
    for (const rule of await Solver.evaluateRuleSet(Logics.restrictuleSet(R, F.values()), F.values())) {
      const str = `${rule}`;
      if (str in F) size = 1;
    }
  } while (size > 0);

  // return {
  //   additions: { implicit: FiAdd, explicit: FeAdd },
  //   deletions: { implicit: FiDel, explicit: FeDel },
  // };
}

// import type { Quad, Term } from '@rdfjs/types';
import { quad, blankNode } from '@rdfjs/data-model';
// import { Rule } from './Rule';

interface Mapping { [key: string]: Term }

/**
* Evaluates a set of rules over a set of facts.
* @param rs
* @param facts
* @returns Array of the evaluation.
*/
export async function evaluateRuleSet(rules: Rule[], quads: Quad[]): Promise<Quad[]> {
  const promises = rules.map((rule) => evaluateThroughRestriction(rule, quads));
  return ([] as Quad[]).concat(...await Promise.all(promises));
}

/**
* Evaluates a rule over a set of facts through
* restriction of the rule's causes.
* @param rule
* @param facts
* @returns {Array}
*/
export async function evaluateThroughRestriction(rule: Rule, dataset: Dataset): Promise<void> {
  getMappings(rule, dataset).flatMap((mapping) => {
    if (!rule.conclusion) {
      throw new Error('Inconsistent database');
    }
    return rule.conclusion.map((q) => substituteQuad(mapping, q));
  })
}

export function getMappings(rule: Rule, dataset: Dataset) {
  let currentCauses = [{
    cause: rule.premise[0],
    mapping: {},
  }]

  for (const nextCause of rule.premise.slice(1)) {
    const newCauses = []
    for (const currentCause of currentCauses) {
      const matches = dataset.
      
      .match(unvar(currentCause.cause.subject), unvar(currentCause.cause.predicate), unvar(currentCause.cause.object), unvar(currentCause.cause.graph))
      matches.
      
      
      .varToUndefinedforEach((quad) => {
      
      
      for (const q of dataset) {
        const mapping = factMatches(q, currentCause.cause, currentCause.mapping);
        if (mapping) {
          newCauses.push({
            cause: substituteQuad(mapping, nextCause),
            mapping,
          });
        }
      }
    }

    currentCauses = newCauses
  }

  return currentCauses.map(({ mapping }) => mapping);
}

function unvar(term: Term) {
  return term.termType === 'Variable' ? undefined : term
}

/**
* Returns a new or updated mapping if a fact matches a rule cause or consequence,
* return false otherwise.
* @param fact
* @param ruleFact
* @param mapping
* @returns {*}
*/
export function factMatches(fact: Quad, term: Quad, mapping: Mapping) {
  const localMapping: Mapping = {};

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
export function substitute(elem: Term, mapping: Mapping): Term {
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

export function substituteQuad(mapping: Mapping, term: Quad) {
  return quad(
    // @ts-ignore
    substitute(term.subject, mapping),
    substitute(term.predicate, mapping),
    substitute(term.object, mapping),
    term.graph // TODO: Double check this
  );
}


export interface Rule {
  premise: RDF.Quad[];
  conclusion: RDF.Quad[] | false;
}

/**
 * A lazy quad source.
 */
 export interface IQuadSource {
  /**
   * Returns a (possibly lazy) stream that processes all quads matching the pattern.
   *
   * The returned stream MUST expose the property 'metadata'.
   * The implementor is reponsible for handling cases where 'metadata'
   * is being called without the stream being in flow-mode.
   *
   * @param {RDF.Term} subject   The exact subject to match, variable is wildcard.
   * @param {RDF.Term} predicate The exact predicate to match, variable is wildcard.
   * @param {RDF.Term} object    The exact object to match, variable is wildcard.
   * @param {RDF.Term} graph     The exact graph to match, variable is wildcard.
   * @return {AsyncIterator<RDF.Quad>} The resulting quad stream.
   */
  match: (subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph: RDF.Term) => AsyncIterator<RDF.Quad>;
}

