/* eslint-disable no-undef */
import Fact from '../lib/Logics/Fact';
import * as Logics from '../lib/Logics/Logics';
import { insertUnique, containsSubset } from '../lib/Utils';

describe('Logics.buildCauses', () => {
  const e1 = new Fact('#p', '#a', '#b', [], true);
  const e2 = new Fact('#p', '#c', '#d', [], true);

  it('should return the conjunction itself when all facts are explicit', () => {
    expect(Logics.buildCauses([e1, e2])).toEqual([[e1, e2]]);
  });

  it('should combine the causes of multiple implicit facts', () => {
    const i1 = new Fact('#q', '#a', '#b', [[e1]], false);
    const i2 = new Fact('#q', '#c', '#d', [[e2]], false);

    const causes = Logics.buildCauses([i1, i2]);
    expect(causes).toHaveLength(1);
    expect(causes[0]).toEqual([e1, e2]);
  });
});

describe('Logics.unify', () => {
  it('should merge the causes of equivalent facts', () => {
    const e1 = new Fact('#p', '#a', '#b', [], true);
    const e2 = new Fact('#p', '#c', '#d', [], true);
    const a1 = new Fact('#q', '#a', '#b', [[e1]], false);
    const a2 = new Fact('#q', '#a', '#b', [[e2]], false);
    const updatingSet = [];

    expect(Logics.unify([a1, a2], updatingSet)).toBe(true);
    expect(updatingSet).toHaveLength(1);
    expect(updatingSet[0].causedBy).toHaveLength(2);
  });
});

describe('Utils set helpers', () => {
  const e1 = new Fact('#p', '#a', '#b', [], true);
  const e2 = new Fact('#p', '#c', '#d', [], true);

  it('insertUnique should work without a bound this', () => {
    expect(insertUnique([e1], e2)).toHaveLength(2);
    expect(insertUnique([e1], e1)).toHaveLength(1);
  });

  it('containsSubset should work without a bound this', () => {
    expect(containsSubset([e1, e2], [e1])).toBe(true);
    expect(containsSubset([e1], [e2])).toBe(false);
  });
});
