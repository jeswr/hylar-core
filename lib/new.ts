import type * as RDF from '@rdfjs/types';
import { quad, blankNode } from '@rdfjs/data-model';
import { type AsyncIterator, single, union, fromArray, wrap, } from 'asynciterator';
// import { Store } from 'n3'

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
    // TODO: LONG TERM, remove wrap here [should not be needed if an actual AsyncIterator is returned in the first place as opposed to the stream that is returned by the N3 store]
    return union(matchers.map(m => wrap(m.match(...args))));
  }
}

function matchToHas(source: { match: Match }): (quad: RDF.Quad) => Promise<boolean> {
  return (quad: RDF.Quad) => new Promise<boolean>((res, rej) => {
    source.match(quad.subject, quad.predicate, quad.object, quad.graph)
    .on('data', () => { res(true) })
    .on('end', () => { res(false) })
    .on('err', e => { rej(e) })
  });
}

function hasUnion(...sources: { match: Match }[]): (quad: RDF.Quad) => Promise<boolean> {
  return async (quad: RDF.Quad) => {
    for (const source of sources) {
      if (await matchToHas(source)(quad)) {
        return true;
      }
    }
    return false;
  }
}

  // return async (quad: RDF.Quad) => {
  //   return new Promise((res, rej) => {
  //     hass.map(async h => {
  //       h.match(quad.subject, quad.predicate, quad.object, quad.graph)
  //       .on('data', () => { res(true) })
  //       .on('end', () => { res(false) })
  //       .on('err', e => { rej(e) })
  //     });
  //   });
    
    
    
    // return hass.some(async h => {
    //   return new Promise((res, rej) => {
      //   h.match(quad.subject, quad.predicate, quad.object, quad.graph)
      //   .on('data', () => { res(true) })
      //   .on('end', () => { res(false) })
      //   .on('err', e => { rej(e) })
      // });
    // })
//   };
// }

export async function incremental({ implicit, explicit, rules }: Args): Promise<void> {
  // console.log('-----------------------')
  // const store = new Store();
  // await new Promise<void>((res, rej) => {
  //   store.import(matchUnion(implicit.source, explicit.source, implicit.additions, explicit.additions)(null, null, null, null))
  //   .on('end', () => {res()})
  //   .on('err', () => {rej()});
  // })
  // console.log(store.getQuads(null, null, null, null))

  // return new Promise((res, rej) => {
  //   matchUnion(implicit.source, explicit.source, implicit.additions, explicit.additions)(null, null, null, null)
  //   .on('data', (d) => { console.log(d) })
  //   .on('end', () => {res()})
  //   .on('err', () => { rej() })
  //   .read()
    // res()
  // })
  // console.log('-----------------------')
  // return;


  const sourceMatch = matchUnion(implicit.source, explicit.source);
  const deletionHas = hasUnion(implicit.deletions, explicit.deletions);
  
  async function evalLoop(restriction: (quad: RDF.Quad) => Promise<boolean>, evalMatch: Match, dataset: { import: RDF.Dataset['import'], size: RDF.Dataset['size'] }) {
    // console.log(1)
    let size: number;
    do {
      size = dataset.size;
      // console.log(2)
      // TODO - work out how to do promised based is signator
      // TODO - double check this filter works properly
      // TODO - run benchmarking on the usefulness of this particular rule restriction algorithm
      // @ts-ignore
      const restrictedRules = fromArray(rules).filter<RestrictableRule>(async (rule: Rule): rule is RestrictableRule => {
        // TODO: Check that this doesn't need to be a 'some' like in
        // https://github.com/jeswr/hylar-core/blob/main/lib/Logics/Logics.ts
        // rule.premise.map(q => { restriction(q) })

        if (rule.conclusion === false) {
          return false
        }

        for (const p of rule.premise) {
          if (!(await restriction(p))) {
            return false
          }
        }
        
        // return rule.conclusion !== false && rule.premise.every(q => { restriction(q) });
        return true;
      })
      // console.log(3)
      const changes = evaluateRuleSet(restrictedRules, evalMatch);
      // console.log(4)
      // await dataset.import(changes);
      // TODO: Change (this is temporary and hacky)
      await new Promise<void>((res, rej) => {
        dataset.import(changes)
        // @ts-ignore
        .on('end', () => {res()})
        // @ts-ignore
        .on('err', () => {rej()});
      })
      // console.log(5)
    } while (dataset.size > size);
  }
  
  await evalLoop(deletionHas, matchUnion({ match: sourceMatch }, explicit.deletions), implicit.deletions);

  function sourceMatchFiltered(...args: Parameters<Match>): ReturnType<Match> {
    return sourceMatch(...args).transform({
      async transform(quad: RDF.Quad, done: () => void, push: (quad: RDF.Quad) => void) {
        if 
      }
    })
      // .filter(async quad => !(await deletionHas(quad)));
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
      // console.log('evaluateThroughRestrictionTransform')
      rule.conclusion.forEach(quad => { push(substituteQuad(mapping, quad)) });
      done();
    }
  })
}

export interface T {
  cause: RDF.Quad,
  mapping: Mapping
}

// export function transformFactory(match: Match) {
//   return function transform({ cause, mapping }: T, done: () => void, push: (mapping: Mapping) => void) {

//     // const unVar = (term: RDF.Term) => term.termType === 'Variable' && term.value in mapping ? mapping[term.value] : term;
//     const unVar = (term: RDF.Term) => term.termType === 'Variable' ? mapping[term.value] : term;

//     // This can be done in parallel
//     match(unVar(cause.subject), unVar(cause.predicate), unVar(cause.object), unVar(cause.graph)).forEach(quad => {
//       const localMapping: Mapping = {};

//       function factElemMatches(factElem: RDF.Term, causeElem: RDF.Term) {
//         if (causeElem.termType === 'Variable') {
//           localMapping[causeElem.value] = factElem;
//         }
//       }
    
//       factElemMatches(quad.predicate, cause.predicate)
//       factElemMatches(quad.object, cause.object)
//       factElemMatches(quad.subject, cause.subject)
//       factElemMatches(quad.graph, cause.graph)
    
//       // If an already existing uri has been mapped...
//       // Merges local and global mapping
//       for (const mapKey in mapping) {
//         for (const key in localMapping) {
//           // This is horribly innefficient, allow lookup in rev direction
//           if (mapping[mapKey] === localMapping[key] && mapKey !== key) return;
//         }
//         localMapping[mapKey] = mapping[mapKey];
//       }
//       console.log('about to push', localMapping, quad, cause)
//       push(localMapping);
//     })

//     done();
//   }
// }

export function transformFactory(match: Match) {
  return function transform({ cause, mapping }: T, done: () => void, push: (mapping: Mapping) => void) {

    // const unVar = (term: RDF.Term) => term.termType === 'Variable' && term.value in mapping ? mapping[term.value] : term;
    const unVar = (term: RDF.Term) => term.termType === 'Variable' ? mapping[term.value] : term;

    // This can be done in parallel
    const data = match(unVar(cause.subject), unVar(cause.predicate), unVar(cause.object), unVar(cause.graph))
    
    data.on('data', quad => {
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
      // console.log('about to push', localMapping, quad, cause)
      push(localMapping);
    })

    data.on('end', () => { done() });
  }
}

export function getMappings(rule: Rule, match: Match) {
  let currentCauses: AsyncIterator<T> = single<T>({ cause: rule.premise[0], mapping: {} })

  for (const nextCause of rule.premise.slice(1)) {
    // TODO: Filter out duplicate mappings if that seems like a problem
    currentCauses = currentCauses.transform<Mapping>({ transform: transformFactory(match) }).map(mapping => ({
      cause: substituteQuad(mapping, nextCause),
      mapping
    }))
  }

  return currentCauses.transform<Mapping>({ transform: transformFactory(match) });
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

// Easy ways to improve hylar
// (1) consider shared premises and re-use mappings
// (2) 
