import type * as RDF from '@rdfjs/types';
import { quad, blankNode } from '@rdfjs/data-model';
import { AsyncIterator, wrap } from 'asynciterator';

interface IQuadSource {
  match: (subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph: RDF.Term) => AsyncIterator<RDF.Quad>;
  add: RDF.DatasetCore['add']
}

export interface Rule {
  premise: RDF.Quad[];
  conclusion: RDF.Quad[] | false;
}

interface RestrictableRule extends Rule {
  premise: RDF.Quad[];
  conclusion: RDF.Quad[];
}

interface Mapping { [key: string]: RDF.Term }

export async function evaluateThroughRestriction(rule: RestrictableRule, dataset: IQuadSource): Promise<void> {
  getMappings(rule, dataset).forEach((mapping) => {

  })
}

export async function getMappings(rule: Rule, source: IQuadSource) {
  let currentCauses: { cause: RDF.Quad, mapping: Mapping }[] = [{
    cause: rule.premise[0],
    mapping: {}, // TODO: Establish how this works in the case of a single premise
  }]

  for (const nextCause of rule.premise.slice(1)) {
    const newCauses = []
    for (const { cause, mapping } of currentCauses) {
      const unVar = (term: RDF.Term) => term.termType === 'Variable' && term.value in mapping ? mapping[term.value] : term;

      const matches = wrap(source.match(unVar(cause.subject), unVar(cause.predicate), unVar(cause.object), unVar(cause.graph)));
      matches.transform<Mapping>({
        transform(quad: RDF.Quad, done, push) {
          const localMapping: Mapping = {};

        function factElemMatches(factElem: RDF.Term, causeElem: RDF.Term) {
          if (causeElem.termType === 'Variable') {
            localMapping[causeElem.value] = factElem;
          }
        }

        factElemMatches(quad.predicate, cause.predicate)
        factElemMatches(quad.object, cause.object)
        factElemMatches(quad.subject, cause.subject)
        factElemMatches(quad.graph, cause.graph)

        // If an already existing uri has been mapped...
        // Merges local and global mapping
        for (const mapKey in mapping) {
          for (const key in localMapping) {
            // This is horribly innefficient, allow lookup in rev direction
            if (mapping[mapKey] === localMapping[key] && mapKey !== key) done();
          }
          localMapping[mapKey] = mapping[mapKey];
        }

        push(mapping);
        }
      })



      source.match(unVar(cause.subject), unVar(cause.predicate), unVar(cause.object), unVar(cause.graph)).forEach((quad) => {
        const localMapping: Mapping = {};

        function factElemMatches(factElem: RDF.Term, causeElem: RDF.Term) {
          if (causeElem.termType === 'Variable') {
            localMapping[causeElem.value] = factElem;
          }
        }

        factElemMatches(quad.predicate, cause.predicate)
        factElemMatches(quad.object, cause.object)
        factElemMatches(quad.subject, cause.subject)
        factElemMatches(quad.graph, cause.graph)

        // If an already existing uri has been mapped...
        // Merges local and global mapping
        for (const mapKey in mapping) {
          for (const key in localMapping) {
            // This is horribly innefficient, allow lookup in rev direction
            if (mapping[mapKey] === localMapping[key] && mapKey !== key) return;
          }
          localMapping[mapKey] = mapping[mapKey];
        }

        newCauses.push({
          cause: substituteQuad(mapping, nextCause),
          mapping,
        });
      })
    }

    currentCauses = newCauses
  }

  return currentCauses.map(({ mapping }) => mapping);
}

export function substitute(elem: RDF.Term, mapping: Mapping): RDF.Term {
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

export function substituteQuad(mapping: Mapping, term: RDF.Quad) {
  return quad(
    // @ts-ignore
    substitute(term.subject, mapping),
    substitute(term.predicate, mapping),
    substitute(term.object, mapping),
    term.graph // TODO: Double check this
  );
}
