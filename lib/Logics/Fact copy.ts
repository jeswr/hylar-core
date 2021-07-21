/**
 * Created by mt on 21/12/2015.
 */

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
    falseFact: string;

    // matches: {};

    predicate: any;

    subject: any;

    object: any;

    consequences: any[];

    // fromTriple: any;

    causedBy: Fact[][];

    explicit: boolean;

    graphs: any[];

    valid: boolean;

    asString: any;

    // private propagate: any;

    // TODO: See if needed
    rule: any;

    constructor(
      pred, sub?, obj?,
      causes = [], expl = true, graphs = [],
      consequences = [], notUsingValidity?,
    ) {
      if (pred === 'FALSE') {
        this.falseFact = 'true';
      }


      this.predicate = pred;
      this.subject = sub;
      this.object = obj;
      this.consequences = consequences;

      this.causedBy = causes;
      this.explicit = expl;
      this.graphs = graphs;

      if (!notUsingValidity && this.explicit) {
        this.valid = true;
      }

      this.asString = this.asPlainString();
    }

    /**
     * Convenient method to stringify a fact.
     * @returns {string}
     */
    asPlainString() {
      let spo;

      if (this.falseFact) {
        spo = 'FALSE';
      } else {
        spo = `(${this.subject}, ${this.predicate}, ${this.object})`;
      }

      return (this.explicit ? 'E' : 'I') + spo;
    }

    toString() {
      return this.asString;
    }

    /**
     * Checks the validity of an implicit fact
     * by exploring its explicit causes' validity tags.
     * An implicit fact is valid iff the disjunction of
     * its explicit causes' validity tags is true, i.e.
     * if at least one of its causes is valid.
     * @param fe
     * @returns {boolean}
     */
    // isValid() {
    //   if (this.explicit) {
    //     return this.valid;
    //   } if (this.causedBy === undefined || this.causedBy.length === 0) {
    //     return false;
    //   }
    //   return this.causedBy.some((cause) => cause.every((explicitFact) => explicitFact.valid));
    // }
}
