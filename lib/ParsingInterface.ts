/*
 * Created by MT on 20/11/2015.
 */

import { quad } from '@rdfjs/data-model';
import { Quad } from 'rdf-js';
import Fact from './Logics/Fact';

/**
 * The parsing interface, for transforming facts, triples, turtle or even results bindings
 * into other representations.
 * The SPARQL parser oddly transforms prefixed typed literal without angle brackets (!).
 * This should fix it.
 */

/**
  * Transforms a triple into a fact.
  * @param t The triple
  * @param explicit True if the resulting fact is explicit, false otherwise (default: true)
  * @returns Object resulting fact
  */
export function quadToFact(t: Quad, explicit = true): Fact {
  return new Fact(
    t.predicate.value,
    t.subject.value,
    t.object.value,
    [],
    explicit,
    t.graph.value ? [t.graph] : [],
  );
}

export function quadsToFacts(t: Quad[], explicit: boolean = true): Fact[] {
  return t.map((triple) => quadToFact(triple, explicit));
}

export function factsToQuads(facts: Fact[]): { implicit: Quad[], explicit: Quad[] } {
  const implicit: Quad[] = [];
  const explicit: Quad[] = [];
  for (const fact of facts) {
    if (fact.graphs.length > 0) {
      for (const graph of fact.graphs) {
        if (fact.explicit) {
          explicit.push(quad(
            fact.subject.toString(),
            fact.predicate.toString(),
            fact.object.toString(),
            graph.toString(),
          ));
        } else {
          implicit.push(quad(
            fact.subject.toString(),
            fact.predicate.toString(),
            fact.object.toString(),
            graph.toString(),
          ));
        }
      }
    } else if (fact.explicit) {
      explicit.push(quad(
        fact.subject.toString(),
        fact.predicate.toString(),
        fact.object.toString(),
      ));
    } else {
      implicit.push(quad(
        fact.subject.toString(),
        fact.predicate.toString(),
        fact.object.toString(),
      ));
    }
  }
  return { implicit, explicit };
}
