/* eslint-disable no-undef */
import { Parser, Writer } from 'n3';
import { termToString } from 'rdf-string';
import {
  factsToQuads, quadsToFacts, incremental, rdfs,
} from '../lib';
import { namedNode, quad } from '@rdfjs/data-model' 
import 'jest-rdf';

const parser = new Parser({ format: 'text/n3' });

const quads = [ 
  quad(namedNode('#subject'), namedNode('http://www.w3.org/2000/01/rdf-schema#type'), namedNode('#object'), namedNode('#graph')),
  quad(namedNode('#object'), namedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf'), namedNode('#namedGraphClass'), namedNode('#graph')),
  quad(namedNode('#defaultGraphSubject'), namedNode('http://www.w3.org/2000/01/rdf-schema#type'), namedNode('#object')),
  quad(namedNode('#object'), namedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf'), namedNode('#defaultGraphClass'), namedNode('#graph')),
]

// Currently all inferences are added to the default
// graph - double check with spec but pretty sure this
// is a bug [we are keeping this as the default behavior]
// for now to avoid introducing a breaking change
const quadsExpectedInferenced = [
  quad(namedNode('#subject'), namedNode('http://www.w3.org/2000/01/rdf-schema#type'), namedNode('#namedGraphClass')),
  quad(namedNode('#subject'), namedNode('http://www.w3.org/2000/01/rdf-schema#type'), namedNode('#defaultGraphClass')),
  quad(namedNode('#defaultGraphSubject'), namedNode('http://www.w3.org/2000/01/rdf-schema#type'), namedNode('#defaultGraphClass')),
];

// TODO: Look into side effecting behavior which is likely a problem here
const quadsExpectedInferencedNamedAndDefault = [
  quad(namedNode('#subject'), namedNode('http://www.w3.org/2000/01/rdf-schema#type'), namedNode('#namedGraphClass'), namedNode('#graph')),
  quad(namedNode('#subject'), namedNode('http://www.w3.org/2000/01/rdf-schema#type'), namedNode('#defaultGraphClass'), namedNode('#graph')),
  quad(namedNode('#defaultGraphSubject'), namedNode('http://www.w3.org/2000/01/rdf-schema#type'), namedNode('#defaultGraphClass')),
]

const quadsExpectedInferencedNamedOnly = [
  quad(namedNode('#subject'), namedNode('http://www.w3.org/2000/01/rdf-schema#type'), namedNode('#namedGraphClass'), namedNode('#graph')),
  // Have an explicit check to make sure that this *does not* exist
  // quad(namedNode('#subject'), namedNode('http://www.w3.org/2000/01/rdf-schema#type'), namedNode('#defaultGraphClass'), namedNode('#graph')),
  quad(namedNode('#defaultGraphSubject'), namedNode('http://www.w3.org/2000/01/rdf-schema#type'), namedNode('#defaultGraphClass')),
]


// describe('test inferencing over named and default graph [default behavior]', () => {
//   it(`Inferenced quads of ${quads} should include ${quadsExpectedInferenced}`, async () => {
//     const facts = quadsToFacts(quads);
//     const { additions } = await incremental(facts, [], [], [], rdfs);
//     const quads2 = factsToQuads(additions);
//     const { implicit } = quads2;
//     // expect(implicit.length).toBe(quadsExpectedInferenced.length);
//     for (const quad of quadsExpectedInferenced) {
//       expect(implicit.find(
//         (q) => q.subject.equals(quad.subject)
//           && q.predicate.equals(quad.predicate)
//           && q.object.equals(quad.object)
//           && q.graph.equals(quad.graph),
//       )).toBeTruthy();
//     }
//   });
// });

describe('test inferencing over named and default graph [separate named graphs with default graph as base]', () => {
  it(`Inferenced quads of ${quads} should include ${quadsExpectedInferencedNamedAndDefault}`, async () => {
    const facts = quadsToFacts(quads);
    const { additions } = await incremental(facts, [], [], [], rdfs, {
      separateNamedInference: true,
      includeDefaultInAll: true
    });

    // console.log('------------ START ---------------')
    
    // additions.filter(x => x.graphs.length > 0).forEach(x => {
    //   console.log(x)
    // });

    // console.log('------------ END ---------------')

    

    const quads2 = factsToQuads(additions);
    const { implicit } = quads2;

    // implicit.forEach(x => {
    //   console.log(x)
    // })
    // console.log(implicit.map(termToString).join('\n'))
    // const writer = new Writer({ format: 'text/n3' });
    // writer.addQuads(implicit);
    // expect(implicit.length).toBe(quadsExpectedInferenced.length);

    for (const quad of quadsExpectedInferencedNamedAndDefault) {
      console.log(quad)
      expect(implicit.find(
        (q) => q.subject.equals(quad.subject)
          && q.predicate.equals(quad.predicate)
          && q.object.equals(quad.object)
          && q.graph.equals(quad.graph),
      )).toBeTruthy();
    }
  });
});


// describe('test inferencing over named and default graph [separate named graphs with default graph as base]', () => {
//   it(`Inferenced quads of ${quads} should include ${quadsExpectedInferencedNamedOnly}`, async () => {
//     const facts = quadsToFacts(quads);
//     const { additions } = await incremental(facts, [], [], [], rdfs, {
//       separateNamedInference: true,
//       includeDefaultInAll: true
//     });

//     // console.log('------------ START ---------------')
    
//     // additions.filter(x => x.graphs.length > 0).forEach(x => {
//     //   console.log(x)
//     // });

//     // console.log('------------ END ---------------')

    

//     const quads2 = factsToQuads(additions);
//     const { implicit } = quads2;

//     // implicit.forEach(x => {
//     //   console.log(x)
//     // })
//     // console.log(implicit.map(termToString).join('\n'))
//     // const writer = new Writer({ format: 'text/n3' });
//     // writer.addQuads(implicit);
//     // expect(implicit.length).toBe(quadsExpectedInferenced.length);

//     for (const quad of quadsExpectedInferencedNamedOnly) {
//       // console.log(quad)
//       expect(implicit.find(
//         (q) => q.subject.equals(quad.subject)
//           && q.predicate.equals(quad.predicate)
//           && q.object.equals(quad.object)
//           && q.graph.equals(quad.graph),
//       )).toBeTruthy();
//     }
//   });
// });
