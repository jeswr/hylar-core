/**
 * Created by Spadon on 13/02/2015.
 */
/**
 * Returns a set of elements
 * with distinct string representation.
 * @param _set1
 * @param _set2
 * @returns {Array}
 */
export declare function uniques(_set1: any, _set2: any): any[];
export declare function insertUnique(_set: any, val: any): any;
export declare function containsSubset(_set1: any, _set2: any): boolean;
/**
 * Checks if a string is a variable,
 * @param str
 * @returns {boolean}
 */
export declare function isVariable(str: any): boolean;
/**
 * Checks if a string is an operator (>, <, >=, <= or =)
 * @param str
 * @returns {boolean}
 */
export declare function isOperator(str: any): boolean;
export declare function removeBeforeSharp(str: any): any;
export declare function equivalentSets(s1: any, s2: any): boolean;
export declare function notInSet(s1: any, elem: any): boolean;
export declare function getValueFromDatatype(datatype: any): any;
export declare function emptyPromise(toBeReturned: any): Promise<unknown>;
export declare function tripleContainsVariable(triple: any): boolean;
export declare function asCHRAtom(elem: any, mapping: any): any;
