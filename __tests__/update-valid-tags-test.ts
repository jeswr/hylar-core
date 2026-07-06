/* eslint-disable no-undef */
import Fact from '../lib/Logics/Fact';
import * as Logics from '../lib/Logics/Logics';

describe('Logics.updateValidTags', () => {
  it('should return unknown additions as new facts', () => {
    const kb = [new Fact('#p', '#a', '#b', [], true)];
    const addition = new Fact('#r', '#x', '#y', [], true);

    const result = Logics.updateValidTags(kb, [addition], []);
    expect(result.new).toEqual([addition]);
    expect(result.resolved).toEqual([]);
  });

  it('should revalidate an existing explicit fact instead of re-adding it', () => {
    const existing = new Fact('#p', '#a', '#b', [], true);
    existing.valid = false;
    const kb = [existing];

    const result = Logics.updateValidTags(kb, [new Fact('#p', '#a', '#b', [], true)], []);
    expect(existing.valid).toBe(true);
    expect(result.new).toEqual([]);
    expect(result.resolved).toEqual([]);
  });

  it('should resolve additions matching an implicit fact', () => {
    const cause = new Fact('#p', '#a', '#b', [], true);
    const implicit = new Fact('#q', '#a', '#b', [[cause]], false);
    const kb = [implicit];
    const addition = new Fact('#q', '#a', '#b', [], true);

    const result = Logics.updateValidTags(kb, [addition], []);
    expect(result.new).toEqual([]);
    expect(result.resolved).toEqual([addition]);
  });

  it('should invalidate deleted explicit facts', () => {
    const existing = new Fact('#p', '#a', '#b', [], true);
    const kb = [existing];

    const result = Logics.updateValidTags(kb, [], [new Fact('#p', '#a', '#b', [], true)]);
    expect(existing.valid).toBe(false);
    expect(result.new).toEqual([]);
    expect(result.resolved).toEqual([]);
  });
});
