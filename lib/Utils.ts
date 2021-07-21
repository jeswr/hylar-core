/* eslint-disable no-param-reassign */
/**
 * Created by Spadon on 13/02/2015.
 */

import * as RegularExpressions from './RegularExpressions';

/**
 * Returns a set of elements
 * with distinct string representation.
 * @param _set1
 * @param _set2
 * @returns {Array}
 */
export function uniques<T>(_set1: T[], _set2: T[]): T[] {
  const hash = {}; const uniq = []; const fullSet = _set1.concat(_set2);

  for (let i = 0; i < fullSet.length; i++) {
    if (fullSet[i] !== undefined) hash[fullSet[i].toString()] = fullSet[i];
  }

  for (const key in hash) {
    uniq.push(hash[key]);
  }
  return uniq;
}

export function insertUnique(_set, val) {
  return this.uniques(_set, [val]);
}

export function containsSubset(_set1, _set2) {
  return this.uniques(_set1, _set2).length === _set1.length;
}

/**
 * Checks if a string is a variable,
 * @param str
 * @returns {boolean}
 */
export function isVariable(str) {
  if (str === undefined) {
    return false;
  }
  try {
    return (str.indexOf('?') === 0);
  } catch (e) {
    return false;
  }
}

/**
 * Checks if a string is an operator (>, <, >=, <= or =)
 * @param str
 * @returns {boolean}
 */
export function isOperator(str) {
  try {
    return ((str === '>') || (str === '<') || (str === '<=') || (str === '>=') || (str === '=='));
  } catch (e) {
    return false;
  }
}

export function getValueFromDatatype(datatype) {
  const rawValueMatch = datatype.match(RegularExpressions.LITERAL_RAW_VALUE)[1];
  const literalWithoutTypeMatch = datatype.match(RegularExpressions.LITERAL_WITHOUT_TYPE)[1];
  if (Number.isNaN(parseFloat(rawValueMatch))) {
    return literalWithoutTypeMatch;
  }
  return rawValueMatch;
}
