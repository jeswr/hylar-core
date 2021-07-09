import { array } from '@on2ts/ontologies-sh';

import { Parser } from 'n3';
import {
  incremental, factsToQuads, quadsToFacts, owl2rl,
} from '../../lib';

const parser = new Parser();

const shaclConstraint = parser.parse(`
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ex: <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:myShape a sh:NodeShape ;
  sh:property [
    sh:path foaf:friend ;
  ] .
`);

describe('Inferencing over a basic NodeShape', () => {
  it('should run', async () => {
    const factsToAdd = [...quadsToFacts(await array()), ...quadsToFacts(shaclConstraint)];
    // // Store to hold explicitly loaded triples
    // const explicit = new Store();
    // // Store to hold implicitly loaded triples
    // const implicit = new Store();

    const { deletions } = await incremental(factsToAdd, [], [], [], owl2rl);
    expect(factsToQuads(deletions).implicit).toHaveLength(0);
    expect(factsToQuads(deletions).explicit).toHaveLength(0);
  });
});
