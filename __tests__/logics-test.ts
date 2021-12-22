import { Store } from 'n3';
// import { quad, namedNode, variable } from '@rdfjs/data-model'

// function arrayifyStream(stream) {
//   return new Promise((res, rej) => {
//     const arr = [];
//     stream.on('data', (quad) => {
//       arr.push(quad);
//     });
//     stream.on('end', () => {
//       res(arr)
//     })
//     stream.on('err', (e) => {
//       rej(e)
//     })
//   })
// }

// describe('Should work', () => {
//   it('This', async () => {
//     const store = new Store();
//     store.addQuads([
//       quad(namedNode('http://example.org#Jesse'), namedNode('http://example.org#a'), namedNode('http://example.org#Person'))
//     ])
//     // @ts-ignore
//     const matches = store.match(namedNode('http://example.org#Jesse'), variable('http://example.org#Jesse'), undefined, undefined)
//     const arr = await arrayifyStream(matches);
//     console.log(arr)
//     expect(arr).toHaveLength(1)
//   });
// });


// TODO: Break up test files
// TODO: FIX THE TO STRING FUNCTION SO THAT WE CAN WORK WITH LITERALS - mostly done

// import { Store } from 'n3';
// import { namedNode, quad, literal } from '@rdfjs/data-model';
// import { owl2rl as rules } from '../lib/Rules';
// import * as Solver from '../lib/Logics/Solver';
// import Fact from '../lib/Logics/Fact';
// import * as ReasoningEngine from '../lib/ReasoningEngine';

// import { factsToQuads, quadsToFacts } from '../lib/ParsingInterface';

// describe('Rule tests', () => {
//   it('should order the rule causes (most to least restrictive)', () => {
//     const transitiveRule = rules[4];

//     transitiveRule.orderCausesByMostRestrictive();
//     // expect(transitiveRule.causes[0].constants.length).toEqual(2);
//   });
// });

import { incremental } from '../lib/new'
// import * as RDF from '@rdfjs/types'
// import { type AsyncIterator } from 'asynciterator';
import { namedNode, quad } from '@rdfjs/data-model';
// import { Dataset } from '@rdfjs/types';

// type Match = (subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph: RDF.Term) => AsyncIterator<RDF.Quad>;


// class MyStore {
//   store = new Store<RDF.Quad>();

//   match(...args: Parameters<Match>): ReturnType<Match> {
//     // @ts-ignore
//     return wrap(this.store.match(...args))
//   }

//   add(q: RDF.Quad) {
//     return this.store.add(q)
//   }
  
//   async import(...args: Parameters<RDF.Dataset['import']>): ReturnType<RDF.Dataset['import']> {
//     return await new Promise((res) => {
//       this.store.import(...args).on('end', () => {
//         // @ts-ignore
//         res(this.store);
//       })
//     })
//   }
  
//   // import: RDF.Dataset['import'] = this.store.import
//   has(q: RDF.Quad) {
//     return this.store.has(q)
//   }

//   get size() {
//     return this.store.size
//   }
// }


// function myStore = new Proxy({

// })

describe('Solver tests', () => {
  // const t: Dataset;
  // t.


  const data = {
    implicit: {
      // @ts-ignore
      additions: new Store(),
      // @ts-ignore
      deletions: new Store(),
      // @ts-ignore
      source: new Store(),
    },
    explicit: {
      // @ts-ignore
      additions: new Store(),
      // @ts-ignore
      deletions: new Store(),
      // @ts-ignore
      source: new Store(),
    },
    rules: [
      {
      premise: [
        quad(
          namedNode('?s'),
          namedNode('a'),
          namedNode('?o')
        )
      ],
      conclusion: [
        quad(
          namedNode('?o'),
          namedNode('a'),
          namedNode('class')
        )
      ]
    }, {
      premise: [
        quad(
          namedNode('?s'),
          namedNode('?p'),
          namedNode('?o')
        )
      ],
      conclusion: [
        quad(
          namedNode('?s'),
          namedNode('a'),
          namedNode('thing')
        ),
        quad(
          namedNode('?o'),
          namedNode('a'),
          namedNode('thing')
        )
      ]
    }
  ]
  }

  data.explicit.additions.add(quad(
    namedNode('Jesse'),
    namedNode('a'),
    namedNode('Human'),
  ))

  it('Should run', async () => {
    // @ts-ignore
    await incremental(data);
    console.log(data.explicit.additions.getQuads(null, null, null, null));
    console.log(data.implicit.additions.getQuads(null, null, null, null));
    console.log(data.explicit.deletions.getQuads(null, null, null, null));
    console.log(data.implicit.deletions.getQuads(null, null, null, null));
    console.log(data.explicit.source.getQuads(null, null, null, null));
    console.log(data.implicit.source.getQuads(null, null, null, null));
  })


  // it('should return inference wrt. transitivity rule', async () => {
    
    
    
    
    
  //   const facts = [
  //     new Fact('#parentOf', '#papy', '#papa', [], true),
  //     new Fact('#parentOf', '#papa', '#fiston', [], true),
  //     new Fact('#parentOf', '#grandpapy', '#papy', [], true),
  //     new Fact('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', '#parentOf', 'http://www.w3.org/2002/07/owl#TransitiveProperty', [], true),
  //   ];

  //   const { additions } = await ReasoningEngine.incremental(facts, [], [], [], rules);
  //   expect(additions.length).toEqual(7);
  // });
  // it('should return inference wrt. transitivity rule', () => {
  //   const facts = [
  //     new Fact('http://www.w3.org/2000/01/rdf-schema#subClassOf', '#mammal', '#animal', [], true),
  //     new Fact('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', '#lion', '#mammal', [], true),
  //   ];

  //   Solver.evaluateRuleSet(rules, facts).then((x) => {
  //     // TODO: Make sure no issues are propogated due to test change
  //     expect(x.cons.length).toEqual(1);
  //   });
  // });
});

// describe('Store integration tests', () => {
//   const storeExplicit = new Store();
//   const storeImplicit = new Store();

//   storeExplicit.addQuads([
//     quad(namedNode('http://example.org/mammal'), namedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf'), namedNode('http://example.org/animal')),
//     quad(namedNode('http://example.org/lion'), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://example.org/animal')),
//     quad(namedNode('http://example.org/lion'), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://example.org/mammal')),
//   ]);

//   // TODO: Merge quads into appropriate graphs format
//   it('should work', async () => {
//     const r = await ReasoningEngine.incremental(
//       quadsToFacts([quad(namedNode('http://example.org/dog'), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://example.org/mammal'))]), [], quadsToFacts(storeExplicit.getQuads(null, null, null, null)), [], rules,
//     );

//     const { implicit, explicit } = factsToQuads(r.additions);
//     storeImplicit.addQuads(implicit);

//     expect(implicit.length).toEqual(2);
//     expect(explicit.length).toEqual(1);
//   });

//   it('should handle literals', async () => {
//     const r = await ReasoningEngine.incremental(
//       quadsToFacts([quad(namedNode('http://example.org/dog'), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), literal('This is a string'))]), [], [], [], rules,
//     );

//     const { explicit } = factsToQuads(r.additions);
//     expect(explicit[0].object.termType).toEqual('Literal');
//   });
// });
