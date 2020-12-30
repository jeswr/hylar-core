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
/**
 * Rule in the form subClassOf(a, b) ^ subClassOf(b, c) -> subClassOf(a, c)
 * i.e. conjunction of facts
 * @param slf set of (left side) conjunctive facts
 * @param ra the consequence facts
 * @constructor
 */
class Rule {
    constructor(slf, srf, name, ruleType = Rule.types.CUSTOM) {
        this.name = name;
        this.causes = [];
        this.operatorCauses = [];
        this.consequences = srf;
        this.constants = [];
        this.dependentRules = [];
        this.matches = {};
        this.type = ruleType;
        for (const s of slf) {
            if (!s.operatorPredicate) {
                this.causes.push(s);
            }
            else {
                this.operatorCauses.push(s);
            }
        }
        for (let i = 0; i < this.causes.length; i++) {
            this.constants = Utils.uniques(this.constants, slf[i].constants);
        }
        for (let i = 0; i < this.consequences.length; i++) {
            this.constants = Utils.uniques(this.constants, srf[i].constants);
        }
        this.orderCausesByMostRestrictive();
    }
    /**
     * Convenient method to stringify a rule.
     * @returns {string}
     */
    toString() {
        let factConj = '';
        for (const key in this.causes) {
            factConj += ` ^ ${this.causes[key].toString().substring(1).replace(/,/g, '')}`;
        }
        for (const key in this.operatorCauses) {
            factConj += ` ^ ${this.operatorCauses[key].toString().substring(1).replace(/,/g, '')}`;
        }
        return `${factConj.substr(3)} -> ${this.consequences.toString().substring(1).replace(/,/g, '')}`;
    }
    setName(name) {
        this.name = name;
    }
    /**
     * Orders rule causes (inplace) from the most to the least restrictive.
     * The least a cause have variables, the most it is restrictive.
     */
    orderCausesByMostRestrictive() {
        const orderedCauses = [];
        let totalConstantOccurences = [];
        for (const cause of this.causes) {
            let constantOccurences = 0;
            if (!cause.subject.startsWith('?')) {
                constantOccurences++;
            }
            if (!cause.predicate.startsWith('?')) {
                constantOccurences++;
            }
            if (!cause.object.startsWith('?')) {
                constantOccurences++;
            }
            totalConstantOccurences.push({
                cause,
                constantOccurences,
            });
        }
        totalConstantOccurences = totalConstantOccurences.sort(
        // eslint-disable-next-line no-nested-ternary
        ({ constantOccurences: x }, { constantOccurences: y }) => ((x > y) ? -1 : ((x < y) ? 1 : 0)));
        for (let i = 0; i < totalConstantOccurences.length; i++) {
            orderedCauses.push(totalConstantOccurences[i].cause);
        }
        this.causes = orderedCauses;
    }
    dependsOn({ consequences }) {
        for (let i = 0; i < consequences.length; i++) {
            const cons = consequences[i];
            for (let j = 0; j < this.causes.length; j++) {
                const cause = this.causes[j];
                if (cause.hasSimilarPatternWith(cons)) {
                    return true;
                }
            }
        }
        return false;
    }
    addDependentRule(rule) {
        if (!(rule in this.dependentRules)) {
            this.dependentRules.push(rule);
        }
    }
    toCHR() {
        let factConj = '';
        const mapping = {};
        for (const key in this.causes) {
            factConj += `, ${this.causes[key].toCHR(mapping)}`;
        }
        for (const key in this.operatorCauses) {
            factConj += `, ${this.operatorCauses[key].toCHR(mapping)}`;
        }
        factConj = `${factConj.substring(2)} ==> `;
        for (const key in this.consequences) {
            factConj += `${this.consequences[key].toCHR(mapping)}, `;
        }
        factConj = factConj.substring(0, factConj.length - 2);
        return factConj;
    }
}
exports.default = Rule;
Rule.types = {
    CUSTOM: 'CUSTOM',
    OWL2RL: 'OWL2RL',
    RDFS: 'RDFS',
};
