/* eslint-disable no-undef */
import * as Logics from '../lib/Logics/Logics';
import * as ReasoningEngine from '../lib/ReasoningEngine';

const SUBCLASS = 'http://www.w3.org/2000/01/rdf-schema#subClassOf';
const TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

describe('Rule.addDependentRule', () => {
  it('should not register the same dependent rule twice', () => {
    const [scm, cax] = Logics.parseRules([
      `scm-sco = (?c1 ${SUBCLASS} ?c2) ^ (?c2 ${SUBCLASS} ?c3) -> (?c1 ${SUBCLASS} ?c3)`,
      `cax-sco = (?c1 ${SUBCLASS} ?c2) ^ (?x ${TYPE} ?c1) -> (?x ${TYPE} ?c2)`,
    ]);

    scm.addDependentRule(cax);
    scm.addDependentRule(cax);
    expect(scm.dependentRules).toEqual([cax]);
  });

  it('should keep dependencies unique across updateRuleDependencies calls', () => {
    const rules = Logics.parseRules([
      `scm-sco = (?c1 ${SUBCLASS} ?c2) ^ (?c2 ${SUBCLASS} ?c3) -> (?c1 ${SUBCLASS} ?c3)`,
      `cax-sco = (?c1 ${SUBCLASS} ?c2) ^ (?x ${TYPE} ?c1) -> (?x ${TYPE} ?c2)`,
    ]);

    ReasoningEngine.updateRuleDependencies(rules);
    const dependentCounts = rules.map((rule) => rule.dependentRules.length);
    ReasoningEngine.updateRuleDependencies(rules);
    expect(rules.map((rule) => rule.dependentRules.length)).toEqual(dependentCounts);
  });
});
