/* eslint-disable no-unused-vars */
/**
 * Created by mt on 21/12/2015.
 */

import type { Quad } from 'rdf-js';
import { termToString } from 'rdf-string';

// import * as Logics from './Logics';

/**
 * Fact in the form subClassOf(a, b)
 * @param pred fact's/axiom name (e.g. subClassOf)
 * @param sub left individual
 * @param obj right individual
 * @param originFacts array of facts causing this
 * @constructor
 */
export default class Fact {
  private asString: string;

  constructor(
    public quad: Quad | false,
    public causedBy: Fact[][] = [],
    public explicit = true,
    public consequences: Fact[] = [],
  ) {
    this.asString = (this.explicit ? 'E' : 'I') + this.quad ? termToString(this.quad as Quad) : 'FALSE';
  }

  toString() {
    return this.asString;
  }
}
