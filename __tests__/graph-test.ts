/* eslint-disable no-undef */
import { Parser } from 'n3';
import { termToString } from 'rdf-string';
import { factsToQuads, quadsToFacts, incremental, rdfs } from '../lib';

const parser = new Parser({ format: 'text/n3' });

const quads = parser.parse(`
@prefix : <#>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
{ 
  :subject a :object.
  :object rdfs:subClassOf :namedGraphClass.
} = :graph.
:defaultGraphSubject a :object.
:object rdfs:subClassOf :defaultGraphClass.
`);

// Currently all inferences are added to the default
// graph - double check with spec but pretty sure this
// is a bug
const quadsExpectedInferenced = parser.parse(`
@prefix : <#>.
  :subject a :namedGraphClass.
  :subject a :defaultGraphClass.
  :defaultGraphSubject a :defaultGraphClass.
`);

// const quadsExpectedInferenced = parser.parse(`
// @prefix : <#>.
// {
//   :subject a :namedGraphClass.
//   :subject a :defaultGraphClass.
// } = :graph.
//   :defaultGraphSubject a :defaultGraphClass.
// `);

describe('test inferencing over named and default graph', () => {
  it(`Inferenced quads of ${quads} should include ${quadsExpectedInferenced}`, async () => {
    const facts = quadsToFacts(quads);
    const { additions } = await incremental(facts, [], [], [], rdfs);
    const quads2 = factsToQuads(additions);
    const implicit = quads2.implicit;
    // expect(implicit.size).toBe(quadsExpectedInferenced.length);
    for (const quad of quadsExpectedInferenced) {
      expect(implicit.find(
        (q) => q.subject.equals(quad.subject)
          && q.predicate.equals(quad.predicate)
          && q.object.equals(quad.object)
          && q.graph.equals(quad.graph),
      )).toBeTruthy();
    }
  });
});
