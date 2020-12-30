/* eslint-disable no-undef */
/**
 * Created by aifb on 15.03.16.
 */

import { Store } from 'n3';
import { namedNode, quad } from '@rdfjs/data-model';
import { owl2rl as rules } from '../lib/Rules';
import * as Solver from '../lib/Logics/Solver';
import Fact from '../lib/Logics/Fact';
import * as ReasoningEngine from '../lib/ReasoningEngine';

import { factsToQuads, triplesToFacts } from '../lib/ParsingInterface';

describe('Rule tests', () => {
  it('should order the rule causes (most to least restrictive)', () => {
    const transitiveRule = rules[4];

    transitiveRule.orderCausesByMostRestrictive();
    expect(transitiveRule.causes[0].constants.length).toEqual(2);
  });
});

describe('Solver tests', () => {
  it('should return inference wrt. transitivity rule', async () => {
    const facts = [
      new Fact('#parentOf', '#papy', '#papa', [], true),
      new Fact('#parentOf', '#papa', '#fiston', [], true),
      new Fact('#parentOf', '#grandpapy', '#papy', [], true),
      new Fact('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', '#parentOf', 'http://www.w3.org/2002/07/owl#TransitiveProperty', [], true),
    ];

    const { additions } = await ReasoningEngine.incremental(facts, [], [], rules);
    expect(additions.length).toEqual(7);
  });
  it('should return inference wrt. transitivity rule', () => {
    const facts = [
      new Fact('http://www.w3.org/2000/01/rdf-schema#subClassOf', '#mammal', '#animal', [], true),
      new Fact('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', '#lion', '#mammal', [], true),
    ];

    Solver.evaluateRuleSet(rules, facts).then((x) => {
      // TODO: Make sure no issues are propogated due to test change
      expect(x.cons.length).toEqual(1);
    });
  });
});

describe('Store integration tests', () => {
  const storeExplicit = new Store();
  const storeImplicit = new Store();

  storeExplicit.addQuads([
    quad(namedNode('http://example.org/mammal'), namedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf'), namedNode('http://example.org/animal')),
    quad(namedNode('http://example.org/lion'), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://example.org/animal')),
    quad(namedNode('http://example.org/lion'), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://example.org/mammal')),
  ]);

  // TODO: Merge quads into appropriate graphs format
  it('should work', async () => {
    const r = await ReasoningEngine.incremental(
      triplesToFacts([quad(namedNode('http://example.org/dog'), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://example.org/mammal'))]), [], triplesToFacts(storeExplicit.getQuads(null, null, null, null)), rules,
    );

    const { implicit, explicit } = factsToQuads(r.additions);
    storeImplicit.addQuads(implicit);

    expect(implicit.length).toEqual(2);
    expect(explicit.length).toEqual(1);
  });
});
