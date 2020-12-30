/**
 * Created by mt on 21/12/2015.
 */

import * as Utils from '../Utils'

/**
 * Rule in the form subClassOf(a, b) ^ subClassOf(b, c) -> subClassOf(a, c)
 * i.e. conjunction of facts
 * @param slf set of (left side) conjunctive facts
 * @param ra the consequence facts
 * @constructor
 */
export default class Rule {
  name: any;
  causes: any[];
  operatorCauses: any[];
  consequences: any;
  constants: any[];
  dependentRules: any[];
  matches: {};
  type: string;
  constructor (slf, srf, name, ruleType = Rule.types.CUSTOM) {
    this.name = name
    this.causes = []
    this.operatorCauses = []
    this.consequences = srf
    this.constants = []
    this.dependentRules = []
    this.matches = {}
    this.type = ruleType

    for (var i = 0; i < slf.length; i++) {
      if (!slf[i].operatorPredicate) {
        this.causes.push(slf[i])
      } else {
        this.operatorCauses.push(slf[i])
      }
    }

    for (var i = 0; i < this.causes.length; i++) {
      this.constants = Utils.uniques(this.constants, slf[i].constants)
    }
    for (var i = 0; i < this.consequences.length; i++) {
      this.constants = Utils.uniques(this.constants, srf[i].constants)
    }
    this.orderCausesByMostRestrictive()
  }

  static types = {
    CUSTOM: 'CUSTOM',
    OWL2RL: 'OWL2RL',
    RDFS: 'RDFS'
  }

  /**
   * Convenient method to stringify a rule.
   * @returns {string}
   */
  toString () {
    let factConj = ''
    for (var key in this.causes) {
      factConj += ` ^ ${this.causes[key].toString().substring(1).replace(/,/g, '')}`
    }
    for (var key in this.operatorCauses) {
      factConj += ` ^ ${this.operatorCauses[key].toString().substring(1).replace(/,/g, '')}`
    }
    return `${factConj.substr(3)} -> ${this.consequences.toString().substring(1).replace(/,/g, '')}`
  }

  setName (name) {
    this.name = name
  }

  /**
   * Orders rule causes (inplace) from the most to the least restrictive.
   * The least a cause have variables, the most it is restrictive.
   */
  orderCausesByMostRestrictive () {
    const orderedCauses = []
    let totalConstantOccurences = []

    for (const cause of this.causes) {
      let constantOccurences = 0
      if (!cause.subject.startsWith('?')) {
        constantOccurences++
      }
      if (!cause.predicate.startsWith('?')) {
        constantOccurences++
      }
      if (!cause.object.startsWith('?')) {
        constantOccurences++
      }
      totalConstantOccurences.push({
        cause: cause,
        constantOccurences: constantOccurences
      })
    }

    totalConstantOccurences = totalConstantOccurences.sort(({ constantOccurences: x }, { constantOccurences: y }) => {
      return ((x > y) ? -1 : ((x < y) ? 1 : 0))
    })

    for (let i = 0; i < totalConstantOccurences.length; i++) {
      orderedCauses.push(totalConstantOccurences[i].cause)
    }

    this.causes = orderedCauses
  }

  dependsOn ({ consequences }) {
    for (let i = 0; i < consequences.length; i++) {
      const cons = consequences[i]
      for (let j = 0; j < this.causes.length; j++) {
        const cause = this.causes[j]
        if (cause.hasSimilarPatternWith(cons)) {
          return true
        }
      }
    }
    return false
  }

  addDependentRule (rule) {
    if (!(rule in this.dependentRules)) {
      this.dependentRules.push(rule)
    }
  }

  toCHR () {
    let factConj = ''
    const mapping = {}
    for (var key in this.causes) {
      factConj += `, ${this.causes[key].toCHR(mapping)}`
    }
    for (key in this.operatorCauses) {
      factConj += `, ${this.operatorCauses[key].toCHR(mapping)}`
    }
    factConj = `${factConj.substring(2)} ==> `

    for (key in this.consequences) {
      factConj += `${this.consequences[key].toCHR(mapping)}, `
    }
    factConj = factConj.substring(0, factConj.length - 2)

    return factConj
  }
}
