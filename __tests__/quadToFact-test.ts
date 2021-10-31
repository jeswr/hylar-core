/* eslint-disable no-undef */
import { Parser } from 'n3';
import { factsToQuads, quadsToFacts } from '../lib';

const parser = new Parser({ format: 'text/n3' });
const quads = parser.parse(`
@prefix : <#>.
@prefix owl: <http://www.w3.org/2002/07/owl#>.
{ 
  :subject a :object.
  :object owl:subClassOf :namedGraphClass.
} = :graph.
:defaultGraphSubject a :object.
:object owl:subClassOf :defaultGraphClass.
`);

describe('quadToFacts tests', () => {
  // See https://github.com/jeswr/hylar-core/issues/155
  it('quadsToFacts and factsToQuads should roundtrip', () => {
    const facts = quadsToFacts(quads);
    const quads2 = factsToQuads(facts);
    const explicit = new Set(quads2.explicit);
    expect(explicit.size).toBe(quads.length);
    for (const quad of explicit) {
      expect(quads.find(
        (q) => q.subject.equals(quad.subject)
          && q.predicate.equals(quad.predicate)
          && q.object.equals(quad.object)
          && q.graph.equals(quad.graph),
      )).toBeTruthy();
    }
  });
});
