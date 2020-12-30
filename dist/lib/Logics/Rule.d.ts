/**
 * Created by mt on 21/12/2015.
 */
/**
 * Rule in the form subClassOf(a, b) ^ subClassOf(b, c) -> subClassOf(a, c)
 * i.e. conjunction of facts
 * @param slf set of (left side) conjunctive facts
 * @param ra the consequence facts
 * @constructor
 */
export default class Rule {
    name: any;
    causes: any[];
    operatorCauses: any[];
    consequences: any;
    constants: any[];
    dependentRules: any[];
    matches: {};
    type: string;
    constructor(slf: any, srf: any, name: any, ruleType?: string);
    static types: {
        CUSTOM: string;
        OWL2RL: string;
        RDFS: string;
    };
    /**
     * Convenient method to stringify a rule.
     * @returns {string}
     */
    toString(): string;
    setName(name: any): void;
    /**
     * Orders rule causes (inplace) from the most to the least restrictive.
     * The least a cause have variables, the most it is restrictive.
     */
    orderCausesByMostRestrictive(): void;
    dependsOn({ consequences }: {
        consequences: any;
    }): boolean;
    addDependentRule(rule: any): void;
    toCHR(): string;
}
