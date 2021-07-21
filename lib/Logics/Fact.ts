/**
 * Created by mt on 21/12/2015.
 */

import * as Utils from '../Utils';
import * as Logics from './Logics';

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

    matches: {};

    predicate: any;

    subject: any;

    object: any;

    consequences: any[];

    fromTriple: any;

    causedBy: Fact[][];

    explicit: boolean;

    graphs: any[];

    valid: boolean;

    constants: any[];

    operatorPredicate: boolean;

    asString: any;

    private propagate: any;

    // TODO: See if needed
    rule: any;

    constructor(
      pred, sub?, obj?,
      causes = [], expl = true, graphs = [],
      consequences = [], notUsingValidity?, fromTriple?,
    ) {
      if (pred === 'FALSE') {
        this.falseFact = 'true';
      }
      this.matches = {};

      this.predicate = pred;
      this.subject = sub;
      this.object = obj;
      this.consequences = consequences;
      this.fromTriple = fromTriple;

      this.causedBy = causes;
      this.explicit = expl;
      this.graphs = graphs;

      if (!notUsingValidity && this.explicit) {
        this.valid = true;
      }

      this.constants = [];
      if (!Utils.isVariable(this.subject)) {
        this.constants.push(this.subject);
      }
      if (!Utils.isVariable(this.predicate)) {
        this.constants.push(this.predicate);
      }
      if (!Utils.isVariable(this.object)) {
        this.constants.push(this.object);
      }

      this.operatorPredicate = false;
      if (Utils.isOperator(this.predicate)) {
        this.operatorPredicate = true;
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

    toRaw() {
      let spo;

      if (this.falseFact) {
        spo = 'FALSE';
      } else {
        spo = `(${this.subject} ${this.predicate} ${this.object})`;
      }

      return spo;
    }

    /**
     * Checks if the fact is equivalent to another fact.
     * @param fact
     * @returns {boolean}
     */
    equivalentTo({
      explicit, subject, predicate, object,
    }) {
      return !((this.explicit !== explicit)
        || (this.subject !== subject)
        || (this.predicate !== predicate)
        || (this.object !== object));
    }

    hasSimilarPatternWith({ subject, predicate, object }) {
      return Logics.similarAtoms(this.subject, subject)
        && Logics.similarAtoms(this.predicate, predicate)
        && Logics.similarAtoms(this.object, object);
    }

    /**
     * Returns the fact if it appears in a set of facts.
     * Returns false otherwise.
     * @param factSet
     */
    appearsIn(factSet) {
      const that = this;
      for (const key in factSet) {
        if (that.equivalentTo(factSet[key])) {
          return key;
        }
      }
      return false;
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
    isValid() {
      if (this.explicit) {
        return this.valid;
      } if (this.causedBy === undefined || this.causedBy.length === 0) {
        return false;
      }
      return this.causedBy.some((cause) => cause.every((explicitFact) => explicitFact.valid));
    }

    doPropagate(keptFact) {
      if (this.propagate) {
        for (let i = 0; i < this.propagate.consequences.length; i++) {
          if (this.propagate.consequences[i] === this) {
            this.propagate.consequences[i] = keptFact;
          }
        }
      }
    }
}
