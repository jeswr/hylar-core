:warning: :warning: :warning:

Before looking at this package I would recommend checking out my more recent reasoning work. Options include:
 - [EYE JS](https://github.com/eyereasoner/eye-js) a WebAssembly build of the [EYE](https://github.com/eyereasoner/eye) reasoner.
 - [Comunica Feature Reasoning](https://github.com/comunica/comunica-feature-reasoning/), which is part of the [Comunica Engine](https://github.com/comunica/comunica) and has ongoing support via the [Comunica Association](https://comunica.dev/association/)

:warning: :warning: :warning:

# hylar-core
A lightweight module containing core reasoner logic from HyLAR (https://github.com/ucbl/HyLAR-Reasoner.git)

## API

The main entrypoint is the `incremental` reasoner:

```ts
incremental(FeAdd, FeDel, FactExplicit, FactImplicit, R):
  Promise<{ additions: Fact[], deletions: Fact[] }>
```

| Parameter | Description |
| --- | --- |
| `FeAdd` | Explicit facts to insert (e.g. `quadsToFacts(quads)`) |
| `FeDel` | Explicit facts to delete; pass `[]` when only inserting |
| `FactExplicit` | Explicit facts currently in the knowledge base |
| `FactImplicit` | Implicit facts previously derived from the knowledge base (e.g. `quadsToFacts(quads, false)`) |
| `R` | Rules to reason over: the exported `owl2rl` or `rdfs` rule sets, or custom rules built with `Logics.parseRules` |

It resolves to the facts to add to the knowledge base (`additions`: the
inserted explicit facts plus the newly derived implicit facts) and the facts
to remove from it (`deletions`: the deleted explicit facts plus the implicit
facts that are no longer derivable). Use `factsToQuads` to split either set
into `{ explicit, implicit }` quads, as in the example below.

## Usage

```ts
import { incremental, factsToQuads, quadsToFacts, owl2rl } from 'hylar-core';
import { Store, Parser } from 'n3';

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

(async () => {
  // Store to hold explicitly loaded triples
  const explicit = new Store();
  // Store to hold implicitly loaded triples
  const implicit = new Store();

  const ontologyQuads = await (await import('@on2ts/ontologies-sh')).array();

  const { additions, deletions } = await incremental(quadsToFacts(ontologyQuads), [], [], [], owl2rl)
  
  implicit.addQuads(factsToQuads(additions).implicit);
  implicit.removeQuads(factsToQuads(deletions).implicit);

  explicit.addQuads(factsToQuads(additions).explicit);
  explicit.removeQuads(factsToQuads(deletions).explicit);
  
  const { additions: shaclAdditions, deletions: shaclDeletions } = await incremental(
    quadsToFacts(shaclConstraint),
    [],
    quadsToFacts(explicit.getQuads(null, null, null, null)),
    quadsToFacts(implicit.getQuads(null, null, null, null), false),
    owl2rl
  );
  
  implicit.addQuads(factsToQuads(shaclAdditions).implicit);
  implicit.removeQuads(factsToQuads(shaclDeletions).implicit);
  
  explicit.addQuads(factsToQuads(shaclAdditions).explicit);
  explicit.removeQuads(factsToQuads(shaclDeletions).explicit);

  /**
   * Implicit store now contains inferenced triples including
   * 
   * _b:1 a sh:PropertyShape ;   (from owl2rl inferences)
   */
})();
```
