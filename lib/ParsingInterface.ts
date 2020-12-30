// @ts-nocheck
/*
 * Created by MT on 20/11/2015.
 */

import { quad } from '@rdfjs/data-model';
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
export function tripleToFact(t, explicit = true) {
  return new Fact(
    t.predicate.value,
    t.subject.value,
    t.object.value,
    [],
    explicit,
    t.graph.value ? [t.graph] : [],
  );
}

export function triplesToFacts(t, explicit?: boolean = true, notUsingValid?: boolean) {
  return t.map((triple) => tripleToFact(triple, explicit, notUsingValid));
}

export function factsToQuads(facts: Fact[]) {
  const implicit = [];
  const explicit = [];
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
