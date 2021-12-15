/* eslint-disable no-undef */
import { Parser } from 'n3';
import { factsToQuads, quadsToFacts } from '../lib';
import 'jest-rdf';

const parser = new Parser({ format: 'text/n3' });
const quads = parser.parse(`
@prefix : <#>.
@prefix owl: <http://www.w3.org/2002/07/owl#>.
{
  :subject :predicate :object.
  :object owl:subClassOf :namedGraphClass.
} = :graph.


  :defaultGraphSubject a :object.
  :object owl:subClassOf :defaultGraphClass.
`);

describe('quadToFacts tests', () => {
  // See https://github.com/jeswr/hylar-core/issues/155
  it('quadsToFacts and factsToQuads should round-trip', () => {
    expect(quads).toEqualRdfQuadArray(factsToQuads(quadsToFacts(quads)).explicit);
  });
});
