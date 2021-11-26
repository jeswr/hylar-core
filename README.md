# hylar-core
A lightweight module containing core reasoner logic from HyLAR (https://github.com/ucbl/HyLAR-Reasoner.git)

## Usage

```ts
import {
  incremental, factsToQuads, quadsToFacts, Rule, owl2rl,
} from 'hylar-core';

import inferencer from 'sparql-inferenced'
import { Store, Parser } from 'n3';
import { owl2rl } from 'hylar-core';
import * as fs from 'fs'

const parser = new Parser();

const ontologyQuads = parser.parse(
  fs.readFileSync(/* Path to SHACL ontology */).toString()
);

const shaclConstraint = parser.parse(`
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ex: <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:myShape a sh:NodeShape ;
  sh:property [
    sh:path foaf:friend ;
  ] .
`)

(async () => {
  // Store to hold explicitly loaded triples
  const explicit = new Store();
  // Store to hold implicitly loaded triples
  const implicit = new Store();

  const { additions, deletions } = await inferencer(quadsToFacts(ontologyQuads), [], [], [], owl2rl)
  const { additions: shaclAdditions, deletions: shaclDeletions } = await inferencer(
    quadsToFacts(shaclConstraint),
    [],
    [...additions.explicit, ...deletions.explicit],
    [...additions.implicit, ...deletions.implicit],
    owl2rl
  );
  
  implicit.addQuads(factsToQuads(additions).implicit);
  implicit.removeQuads(factsToQuads(deletions).implicit);
  
  implicit.addQuads(factsToQuads(shaclAdditions).implicit);
  implicit.removeQuads(factsToQuads(shaclDeletions).implicit);
  
  explicit.addQuads(factsToQuads(additions).explicit);
  explicit.removeQuads(factsToQuads(deletions).explicit);
  
  explicit.addQuads(factsToQuads(shaclAdditions).explicit);
  explicit.removeQuads(factsToQuads(shaclDeletions).explicit);


  /**
   * Implicit now contains inferenced triples including
   * 
   * _b:1 a sh:PropertyShape ;   (from owl2rl inferences)
   */

})
