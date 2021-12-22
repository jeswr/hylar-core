import type * as RDF from '@rdfjs/types';
import { quad, blankNode } from '@rdfjs/data-model';
import { type AsyncIterator, single, union, fromArray } from 'asynciterator';

type Match = (subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph: RDF.Term) => AsyncIterator<RDF.Quad>;

export interface Rule {
  premise: RDF.Quad[];
  conclusion: RDF.Quad[] | false;
}

interface RestrictableRule extends Rule {
  premise: RDF.Quad[];
  conclusion: RDF.Quad[];
}

interface Mapping { [key: string]: RDF.Term }

export interface Args {
  implicit: {
    source: { match: Match, has: RDF.Dataset['has'] },
    additions: { match: Match, size: number, import: RDF.Dataset['import'], has: RDF.Dataset['has'] },
    deletions: { match: Match, size: number, import: RDF.Dataset['import'], has: RDF.Dataset['has'] },
  },
  explicit: {
    source: { match: Match, has: RDF.Dataset['has'] },
    additions: { match: Match, has: RDF.Dataset['has'] },
    deletions: { match: Match, has: RDF.Dataset['has'] }
  },
  rules: Rule[]
}

function matchUnion(...matchers: { match: Match }[]): Match {
  return (...args: Parameters<Match>) => {
    return union(matchers.map(m => m.match(...args)));
  }
}

const hasUnion = (...hass: { match: Match }[]): RDF.Dataset['has'] => {
  return (quad: RDF.Quad) => {
    return hass.some(async h => {
      return new Promise((res, rej) => {
        h.match(quad.subject, quad.predicate, quad.object, quad.graph)
        .on('data', () => { res(true) })
        .on('end', () => { res(false) })
        .on('err', e => { rej(e) })
      });
    }) 
  };
}

export async function incremental({ implicit, explicit, rules }: Args): Promise<void> {
  console.log('-----------------------')
  // matchUnion(implicit.source, explicit.source)(null, null, null, null)
  console.log('-----------------------')


  const sourceMatch = matchUnion(implicit.source, explicit.source);
  const deletionHas = hasUnion(implicit.deletions, explicit.deletions);
  
  async function evalLoop(restriction: RDF.Dataset['has'], evalMatch: Match, dataset: { import: RDF.Dataset['import'], size: RDF.Dataset['size'] }) {
    // console.log(1)
    let size: number;
    do {
      size = dataset.size;
      // console.log(2)
      const restrictedRules = fromArray(rules).filter<RestrictableRule>((rule: Rule): rule is RestrictableRule => {
        // TODO: Check that this doesn't need to be a 'some' like in
        // https://github.com/jeswr/hylar-core/blob/main/lib/Logics/Logics.ts
        console.log(rule.premise.map(q => { restriction(q) }))
        // return rule.conclusion !== false && rule.premise.every(q => { restriction(q) });
        return rule.conclusion !== false
      })
      // console.log(3)
      const changes = evaluateRuleSet(restrictedRules, evalMatch);
      // console.log(4)
      await dataset.import(changes);
      // console.log(5)
    } while (dataset.size > size);
  }
  
  await evalLoop(deletionHas, matchUnion({ match: sourceMatch }, explicit.deletions), implicit.deletions);

  function sourceMatchFiltered(...args: Parameters<Match>): ReturnType<Match> {
    return sourceMatch(...args)
    // .filter(quad => !deletionHas(quad));
  }

  // function sourceHasFiltered(quad: RDF.Quad): boolean {
  //   return !deletionHas(quad) && hasUnion(implicit.source, explicit.source)(quad);
  // }

  await evalLoop(hasUnion(implicit.deletions), sourceMatchFiltered, implicit.additions)
  await evalLoop(
    hasUnion({ match: sourceMatchFiltered }, explicit.additions, implicit.additions),
    matchUnion({ match: sourceMatchFiltered }, explicit.additions, implicit.additions),
    implicit.additions
  )
}

export function evaluateRuleSet(rules: AsyncIterator<RestrictableRule> | RestrictableRule[], match: Match): AsyncIterator<RDF.Quad> {
  return union(rules.map((rule: RestrictableRule) => evaluateThroughRestriction(rule, match)));
}

export function evaluateThroughRestriction(rule: RestrictableRule, match: Match): AsyncIterator<RDF.Quad> {
  // This can be done in parallel
  return getMappings(rule, match).transform({
    transform(mapping, done, push) {
      rule.conclusion.forEach(quad => { push(substituteQuad(mapping, quad)) });
      done();
    }
  })
}

interface T {
  cause: RDF.Quad,
  mapping: Mapping
}

export function getMappings(rule: Rule, match: Match) {
  console.log('start of getMappings')
  function transform({ cause, mapping }: T, done: () => void, push: (mapping: Mapping) => void) {

    // const unVar = (term: RDF.Term) => term.termType === 'Variable' && term.value in mapping ? mapping[term.value] : term;
    const unVar = (term: RDF.Term) => term.termType === 'Variable' ? mapping[term.value] : term;

    // This can be done in parallel
    match(unVar(cause.subject), unVar(cause.predicate), unVar(cause.object), unVar(cause.graph)).forEach(quad => {
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
    
      push(localMapping);
    })

    done();
  }

  let currentCauses: AsyncIterator<T> = single<T>({ cause: rule.premise[0], mapping: {} })

  for (const nextCause of rule.premise.slice(1)) {
    // TODO: Filter out duplicate mappings if that seems like a problem
    currentCauses = currentCauses.transform<Mapping>({ transform }).map(mapping => ({
      cause: substituteQuad(mapping, nextCause),
      mapping
    }))
  }

  console.log('end of getMapping')

  return currentCauses.transform<Mapping>({ transform });
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
    substitute(term.graph, mapping),
  );
}
