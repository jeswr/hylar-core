/* eslint-disable no-undef */
import Fact from '../lib/Logics/Fact';
import * as Logics from '../lib/Logics/Logics';
import * as Solver from '../lib/Logics/Solver';

const AGE = 'http://example.org/age';
const TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const ADULT = 'http://example.org/Adult';
const WORKING_AGE = 'http://example.org/WorkingAge';

describe('Solver.checkOperators', () => {
  it('should discard every mapping violating an operator cause', async () => {
    const [rule] = Logics.parseRules([`adult = (?x ${AGE} ?age) ^ (?age > "18") -> (?x ${TYPE} ${ADULT})`]);
    const facts = [
      new Fact(AGE, '#kid1', '"10"'),
      new Fact(AGE, '#kid2', '"11"'),
      new Fact(AGE, '#adult', '"25"'),
    ];

    const { cons } = await Solver.evaluateRuleSet([rule], facts);
    expect(cons.map((c) => c.subject)).toEqual(['#adult']);
  });

  it('should check every operator cause of a mapping', async () => {
    const [rule] = Logics.parseRules([`working = (?x ${AGE} ?age) ^ (?age > "18") ^ (?age < "65") -> (?x ${TYPE} ${WORKING_AGE})`]);
    const facts = [
      new Fact(AGE, '#kid', '"10"'),
      new Fact(AGE, '#adult', '"25"'),
      new Fact(AGE, '#senior', '"70"'),
    ];

    const { cons } = await Solver.evaluateRuleSet([rule], facts);
    expect(cons.map((c) => c.subject)).toEqual(['#adult']);
  });
});
