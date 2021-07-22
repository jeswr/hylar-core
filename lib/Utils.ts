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
export function uniques<T>(...sets: T[][]): T[] {
  const hash = {}; const uniq = []; const fullSet = [].concat(...sets);

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

export function getValueFromDatatype(datatype) {
  const rawValueMatch = datatype.match(RegularExpressions.LITERAL_RAW_VALUE)[1];
  const literalWithoutTypeMatch = datatype.match(RegularExpressions.LITERAL_WITHOUT_TYPE)[1];
  if (Number.isNaN(parseFloat(rawValueMatch))) {
    return literalWithoutTypeMatch;
  }
  return rawValueMatch;
}
