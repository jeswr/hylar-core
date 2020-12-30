"use strict";
/**
 * Created by mt on 21/12/2015.
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
Object.defineProperty(exports, "__esModule", { value: true });
const Utils = __importStar(require("../Utils"));
const Logics = __importStar(require("./Logics"));
/**
 * Fact in the form subClassOf(a, b)
 * @param pred fact's/axiom name (e.g. subClassOf)
 * @param sub left individual
 * @param obj right individual
 * @param originFacts array of facts causing this
 * @constructor
 */
class Fact {
    constructor(pred, sub, obj, causes = [], expl = true, graphs = [], consequences = [], notUsingValidity, fromTriple) {
        if (pred === 'FALSE') {
            this.falseFact = 'true';
        }
        this.matches = {};
        this.predicate = pred;
        this.subject = sub;
        this.object = obj;
        this.consequences = consequences;
        this.fromTriple = fromTriple;
        this.causedBy = causes;
        this.explicit = expl;
        this.graphs = graphs;
        if (!notUsingValidity && this.explicit) {
            this.valid = true;
        }
        this.constants = [];
        if (!Utils.isVariable(this.subject)) {
            this.constants.push(this.subject);
        }
        if (!Utils.isVariable(this.predicate)) {
            this.constants.push(this.predicate);
        }
        if (!Utils.isVariable(this.object)) {
            this.constants.push(this.object);
        }
        this.operatorPredicate = false;
        if (Utils.isOperator(this.predicate)) {
            this.operatorPredicate = true;
        }
        this.asString = this.asPlainString();
    }
    /**
     * Convenient method to stringify a fact.
     * @returns {string}
     */
    asPlainString() {
        let spo;
        if (this.falseFact) {
            spo = 'FALSE';
        }
        else {
            spo = `(${this.subject}, ${this.predicate}, ${this.object})`;
        }
        return (this.explicit ? 'E' : 'I') + spo;
    }
    toString() {
        return this.asString;
    }
    toCHR(mapping) {
        let chrized;
        if (mapping === undefined) {
            mapping = {};
        }
        if (this.falseFact) {
            chrized = 'FALSE()';
        }
        else {
            chrized = `t(${this.subjectCHR(mapping)}, ${this.predicateCHR(mapping)}, ${this.objectCHR(mapping)})`;
        }
        return chrized;
    }
    toRaw() {
        let spo;
        if (this.falseFact) {
            spo = 'FALSE';
        }
        else {
            spo = `(${this.subject} ${this.predicate} ${this.object})`;
        }
        return spo;
    }
    subjectCHR(mapping) {
        return Utils.asCHRAtom(this.subject, mapping);
    }
    predicateCHR(mapping) {
        return Utils.asCHRAtom(this.predicate, mapping);
    }
    objectCHR(mapping) {
        return Utils.asCHRAtom(this.object, mapping);
    }
    truncatedString() {
        let spo;
        if (this.falseFact) {
            spo = 'FALSE';
        }
        else {
            spo = `(${Utils.removeBeforeSharp(this.subject)}, ${Utils.removeBeforeSharp(this.predicate)}, ${Utils.removeBeforeSharp(this.object)})`;
        }
        return (this.explicit ? 'E' : 'I') + spo;
    }
    /**
     * Checks if the fact is equivalent to another fact.
     * @param fact
     * @returns {boolean}
     */
    equivalentTo({ explicit, subject, predicate, object, }) {
        return !((this.explicit !== explicit)
            || (this.subject !== subject)
            || (this.predicate !== predicate)
            || (this.object !== object));
    }
    hasSimilarPatternWith({ subject, predicate, object }) {
        return Logics.similarAtoms(this.subject, subject)
            && Logics.similarAtoms(this.predicate, predicate)
            && Logics.similarAtoms(this.object, object);
    }
    /**
     * Returns the fact if it appears in a set of facts.
     * Returns false otherwise.
     * @param factSet
     */
    appearsIn(factSet) {
        const that = this;
        for (const key in factSet) {
            if (that.equivalentTo(factSet[key])) {
                return key;
            }
        }
        return false;
    }
    /**
     * Checks the validity of an implicit fact
     * by exploring its explicit causes' validity tags.
     * An implicit fact is valid iff the disjunction of
     * its explicit causes' validity tags is true, i.e.
     * if at least one of its causes is valid.
     * @param fe
     * @returns {boolean}
     */
    isValid() {
        if (this.explicit) {
            return this.valid;
        }
        if (this.causedBy === undefined || this.causedBy.length === 0) {
            return undefined;
        }
        let valid;
        const causes = this.causedBy;
        let explicitFact;
        for (let i = 0; i < causes.length; i++) {
            valid = true;
            for (let j = 0; j < causes[i].length; j++) {
                explicitFact = causes[i][j];
                valid = valid && explicitFact.valid;
            }
            return valid;
        }
        return false;
    }
    derives(kb) {
        const factsDerived = [];
        for (let i = 0; i < kb.length; i++) {
            if (this.appearsIn(kb[i].implicitCauses)) {
                factsDerived.push(kb[i]);
            }
            else {
                for (let j = 0; j < kb[i].causedBy.length; j++) {
                    if (this.appearsIn(kb[i].causedBy[j])) {
                        factsDerived.push(kb[i]);
                        break;
                    }
                }
            }
        }
        return factsDerived;
    }
    doPropagate(keptFact) {
        if (this.__propagate__) {
            for (let i = 0; i < this.__propagate__.consequences.length; i++) {
                if (this.__propagate__.consequences[i] === this) {
                    this.__propagate__.consequences[i] = keptFact;
                }
            }
        }
    }
}
exports.default = Fact;
