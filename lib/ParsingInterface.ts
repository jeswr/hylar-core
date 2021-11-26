/* eslint-disable camelcase */
/*
 * Created by MT on 20/11/2015.
 */

import type { Quad } from 'rdf-js';
import Fact from './Logics/Fact';

export function quadsToFacts(terms: Quad[], explicit: boolean = true): Fact[] {
  return terms.map((triple) => new Fact(triple, explicit));
}

export function factsToQuads(facts: Fact[]): { implicit: Quad[], explicit: Quad[] } {
  return {
    implicit: facts.filter((fact) => !fact.explicit && fact.quad).map((fact) => fact.quad as Quad),
    explicit: facts.filter((fact) => fact.explicit && fact.quad).map((fact) => fact.quad as Quad),
  };
}
