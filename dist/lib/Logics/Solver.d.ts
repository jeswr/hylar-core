/**
 * Created by pc on 27/01/2016.
 */
/**
* Core solver used to evaluate rules against facts
* using pattern matching mechanisms.
* /

/**
* Evaluates a set of rules over a set of facts.
* @param rs
* @param facts
* @returns Array of the evaluation.
*/
export declare function evaluateRuleSet(rs: any, facts: any, doTagging?: boolean): Promise<{
    cons: any[];
}>;
/**
* Evaluates a rule over a set of facts through
* restriction of the rule's causes.
* @param rule
* @param facts
* @returns {Array}
*/
export declare function evaluateThroughRestriction(rule: any, facts: any): Promise<any[]>;
/**
* Evaluates a rule over a set of facts through
* restriction of the rule's causes with tagging.
* @param rule
* @param kb
* @returns {Array}
*/
export declare function evaluateThroughRestrictionWithTagging(rule: any, kb: any): any[];
export declare function checkOperators(rule: any, mappingList: any): any;
export declare function getMappings(rule: any, facts: any): any;
/**
* Updates the mapping of the current cause
* given the next cause of a rule, over a
* set of facts.
* @param currentCauses
* @param nextCause
* @param facts
* @returns {Array}
*/
export declare function substituteNextCauses(currentCauses: any, nextCause: any, facts: any, constants: any, rule: any): any[];
/**
* Returns a new or updated mapping if a fact matches a rule cause or consequence,
* return false otherwise.
* @param fact
* @param ruleFact
* @param mapping
* @returns {*}
*/
export declare function factMatches(fact: any, { predicate, object, subject }: {
    predicate: any;
    object: any;
    subject: any;
}, mapping: any): {};
export declare function factElemMatches(factElem: any, causeElem: any, globalMapping: any, localMapping: any): boolean;
/**
* Substitutes an element given the mapping.
* @param elem
* @param mapping
* @returns {*}
*/
export declare function substituteElementVariablesWithMapping(elem: any, mapping: any): any;
/**
* Substitutes fact's variable members (sub, pred, obj)
* given the mapping.
* @param mapping
* @param notYetSubstitutedFact
* @param causedBy
* @param rule
* @returns {*}
*/
export declare function substituteFactVariables(mapping: any, notYetSubstitutedFact: any, causedBy: any, rule: any): any;
