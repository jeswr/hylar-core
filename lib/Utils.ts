/* eslint-disable no-param-reassign */
/**
 * Created by Spadon on 13/02/2015.
 */

import RegularExpressions from './RegularExpressions';
import * as Logics from './Logics/Logics';

/**
 * Returns a set of elements
 * with distinct string representation.
 * @param _set1
 * @param _set2
 * @returns {Array}
 */
export function uniques(_set1, _set2) {
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

export function removeBeforeSharp(str) {
  if (str.indexOf('#') === -1 || str.charAt(0) === '"') return str;
  const splitted = str.split('#');
  return /* splitted[0].slice(0,10) + '...#' + */splitted[1];
}

export function equivalentSets(s1, s2) {
  if (s1.toString() === s2.toString()) {
    return true;
  }
  if (s1.length !== s2.length) {
    return false;
  }
  for (let i = 0; i < s1.length; i++) {
    if (this.notInSet(s2, s1[i])) {
      return false;
    }
  }
  return true;
}

export function notInSet(s1, elem) {
  return (s1.toString().indexOf(elem.toString()) === -1);
}

export function getValueFromDatatype(datatype) {
  const rawValueMatch = datatype.match(RegularExpressions.LITERAL_RAW_VALUE)[1];
  const literalWithoutTypeMatch = datatype.match(RegularExpressions.LITERAL_WITHOUT_TYPE)[1];
  if (Number.isNaN(parseFloat(rawValueMatch))) {
    return literalWithoutTypeMatch;
  }
  return rawValueMatch;
}

export function emptyPromise(toBeReturned) {
  return new Promise((resolve) => { resolve(toBeReturned); });
}

export function tripleContainsVariable(triple) {
  if (this.isVariable(triple.subject)
    || this.isVariable(triple.predicate)
    || this.isVariable(triple.object)) {
    return true;
  }
  return false;
}

export function asCHRAtom(elem, mapping) {
  if (Logics.isVariable(elem)) {
    if (mapping[elem] === undefined) {
      if (mapping.__lastCHRVar) {
        mapping.__lastCHRVar = String.fromCharCode(mapping.__lastCHRVar.charCodeAt(0) + 1);
      } else {
        mapping.__lastCHRVar = 'A';
      }
      mapping[elem] = mapping.__lastCHRVar;
    }
    return mapping[elem];
  }
  return `"${elem.replace(/[^a-zA-Z]/g, '')}"`;
}
