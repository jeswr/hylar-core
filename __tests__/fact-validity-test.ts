/* eslint-disable no-undef */
import Fact from '../lib/Logics/Fact';

// See https://github.com/jeswr/hylar-core/issues/169
describe('Fact.isValid', () => {
  const valid = new Fact('#p', '#a', '#b', [], true);
  const invalid = new Fact('#p', '#c', '#d', [], true);
  invalid.valid = false;

  it('should return the validity tag of explicit facts', () => {
    expect(valid.isValid()).toBe(true);
    expect(invalid.isValid()).toBe(false);
  });

  it('should return undefined for implicit facts without causes', () => {
    expect(new Fact('#q', '#a', '#d', [], false).isValid()).toBeUndefined();
  });

  it('should return true when the only cause is valid', () => {
    expect(new Fact('#q', '#a', '#d', [[valid]], false).isValid()).toBe(true);
  });

  it('should return true when an alternative cause is valid', () => {
    // The disjunction of causes must be explored beyond the first conjunction
    expect(new Fact('#q', '#a', '#d', [[invalid], [valid]], false).isValid()).toBe(true);
  });

  it('should return false when no cause is fully valid', () => {
    expect(new Fact('#q', '#a', '#d', [[invalid], [valid, invalid]], false).isValid()).toBe(false);
  });
});
