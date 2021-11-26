/**
 * Created by mt on 21/12/2015.
 */

import * as Utils from '../Utils';
import Fact from './Fact';

/**
 * Rule in the form subClassOf(a, b) ^ subClassOf(b, c) -> subClassOf(a, c)
 * i.e. conjunction of facts
 * @param slf set of (left side) conjunctive facts
 * @param ra the consequence facts
 * @constructor
 */
export default class Rule {
  causes: Fact[];

  operatorCauses: Fact[];

  consequences: Fact[];

  constants: any[];

  constructor(slf, srf) {
    this.causes = [];
    this.operatorCauses = [];
    this.consequences = srf;
    this.constants = [];

    for (const s of slf) {
      if (!s.operatorPredicate) {
        this.causes.push(s);
      } else {
        this.operatorCauses.push(s);
      }
    }

    for (let i = 0; i < this.causes.length; i++) {
      this.constants = Utils.uniques(this.constants, slf[i].constants);
    }
    for (let i = 0; i < this.consequences.length; i++) {
      this.constants = Utils.uniques(this.constants, srf[i].constants);
    }
    this.orderCausesByMostRestrictive();
  }

  /**
   * Convenient method to stringify a rule.
   * @returns {string}
   */
  toString() {
    let factConj = '';
    for (const key in this.causes) {
      factConj += ` ^ ${this.causes[key].toString().substring(1).replace(/,/g, '')}`;
    }
    for (const key in this.operatorCauses) {
      factConj += ` ^ ${this.operatorCauses[key].toString().substring(1).replace(/,/g, '')}`;
    }
    return `${factConj.substr(3)} -> ${this.consequences.toString().substring(1).replace(/,/g, '')}`;
  }

  /**
   * Orders rule causes (inplace) from the most to the least restrictive.
   * The least a cause have variables, the most it is restrictive.
   */
  orderCausesByMostRestrictive() {
    this.causes = this.causes.map((cause) => {
      const { quad } = cause;
      let constantOccurences = 0;
      if (quad) {
        if (quad.subject.termType === 'Variable') constantOccurences += 1;
        if (quad.predicate.termType === 'Variable') constantOccurences += 1;
        if (quad.object.termType === 'Variable') constantOccurences += 1;
      }
      return { cause, constantOccurences };
    }).sort(
      // eslint-disable-next-line no-nested-ternary
      ({ constantOccurences: x }, { constantOccurences: y }) => ((x > y) ? -1 : ((x < y) ? 1 : 0)),
    ).map(({ cause }) => cause);
  }
}
