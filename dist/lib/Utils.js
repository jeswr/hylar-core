"use strict";
/* eslint-disable no-param-reassign */
/**
 * Created by Spadon on 13/02/2015.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asCHRAtom = exports.tripleContainsVariable = exports.emptyPromise = exports.getValueFromDatatype = exports.notInSet = exports.equivalentSets = exports.removeBeforeSharp = exports.isOperator = exports.isVariable = exports.containsSubset = exports.insertUnique = exports.uniques = void 0;
const RegularExpressions_1 = __importDefault(require("./RegularExpressions"));
const Logics = __importStar(require("./Logics/Logics"));
/**
 * Returns a set of elements
 * with distinct string representation.
 * @param _set1
 * @param _set2
 * @returns {Array}
 */
function uniques(_set1, _set2) {
    const hash = {};
    const uniq = [];
    const fullSet = _set1.concat(_set2);
    for (let i = 0; i < fullSet.length; i++) {
        if (fullSet[i] !== undefined)
            hash[fullSet[i].toString()] = fullSet[i];
    }
    for (const key in hash) {
        uniq.push(hash[key]);
    }
    return uniq;
}
exports.uniques = uniques;
function insertUnique(_set, val) {
    return this.uniques(_set, [val]);
}
exports.insertUnique = insertUnique;
function containsSubset(_set1, _set2) {
    return this.uniques(_set1, _set2).length === _set1.length;
}
exports.containsSubset = containsSubset;
/**
 * Checks if a string is a variable,
 * @param str
 * @returns {boolean}
 */
function isVariable(str) {
    if (str === undefined) {
        return false;
    }
    try {
        return (str.indexOf('?') === 0);
    }
    catch (e) {
        return false;
    }
}
exports.isVariable = isVariable;
/**
 * Checks if a string is an operator (>, <, >=, <= or =)
 * @param str
 * @returns {boolean}
 */
function isOperator(str) {
    try {
        return ((str === '>') || (str === '<') || (str === '<=') || (str === '>=') || (str === '=='));
    }
    catch (e) {
        return false;
    }
}
exports.isOperator = isOperator;
function removeBeforeSharp(str) {
    if (str.indexOf('#') === -1 || str.charAt(0) === '"')
        return str;
    const splitted = str.split('#');
    return /* splitted[0].slice(0,10) + '...#' + */ splitted[1];
}
exports.removeBeforeSharp = removeBeforeSharp;
function equivalentSets(s1, s2) {
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
exports.equivalentSets = equivalentSets;
function notInSet(s1, elem) {
    return (s1.toString().indexOf(elem.toString()) === -1);
}
exports.notInSet = notInSet;
function getValueFromDatatype(datatype) {
    const rawValueMatch = datatype.match(RegularExpressions_1.default.LITERAL_RAW_VALUE)[1];
    const literalWithoutTypeMatch = datatype.match(RegularExpressions_1.default.LITERAL_WITHOUT_TYPE)[1];
    if (Number.isNaN(parseFloat(rawValueMatch))) {
        return literalWithoutTypeMatch;
    }
    return rawValueMatch;
}
exports.getValueFromDatatype = getValueFromDatatype;
function emptyPromise(toBeReturned) {
    return new Promise((resolve) => { resolve(toBeReturned); });
}
exports.emptyPromise = emptyPromise;
function tripleContainsVariable(triple) {
    if (this.isVariable(triple.subject)
        || this.isVariable(triple.predicate)
        || this.isVariable(triple.object)) {
        return true;
    }
    return false;
}
exports.tripleContainsVariable = tripleContainsVariable;
function asCHRAtom(elem, mapping) {
    if (Logics.isVariable(elem)) {
        if (mapping[elem] === undefined) {
            if (mapping.__lastCHRVar) {
                mapping.__lastCHRVar = String.fromCharCode(mapping.__lastCHRVar.charCodeAt(0) + 1);
            }
            else {
                mapping.__lastCHRVar = 'A';
            }
            mapping[elem] = mapping.__lastCHRVar;
        }
        return mapping[elem];
    }
    return `"${elem.replace(/[^a-zA-Z]/g, '')}"`;
}
exports.asCHRAtom = asCHRAtom;
