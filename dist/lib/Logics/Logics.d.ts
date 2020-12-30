/**
 * Created by MT on 11/09/2015.
 * Logics module
 */
import Rule from './Rule';
/**
 * All necessary stuff around the Logics module
 * @type {{substractFactSets: Function, mergeFactSets: Function}}
 */
/**
 * True-like merge of two facts sets, which also merges
 * identical facts causedBy properties.
 * @param fs1
 * @param fs2
 */
export declare function combine(fs: any, subset: any): void;
/**
 * Returns implicit facts from the set.
 * @param fs
 * @returns {Array}
 */
export declare function getOnlyImplicitFacts(fs: any): any[];
/**
 * Returns explicit facts from the set.
 * @param fs
 * @returns {Array}
 */
export declare function getOnlyExplicitFacts(fs: any): any[];
/**
 * Returns a restricted rule set,
 * in which at least one fact from the fact set
 * matches all rules.
 * @param rs
 * @param fs
 * @returns {Array}
 */
export declare function restrictRuleSet(rs: any, fs: any): any[];
/**
 * Checks if a cause matches a fact, i.e. is the cause's pattern
 * can be satisfied by the fact.
 * @param cause
 * @param fact
 * @returns {*}
 */
export declare function causeMatchesFact(fact1: any, fact2: any): boolean;
/**
 * Return true if the cause and fact members (subjects, objects or predicates)
 * are equal (if URI) or if both are variables. Returns false otherwise.
 * @param causeMember
 * @param factMember
 * @returns {boolean}
 */
export declare function causeMemberMatchesFactMember(causeMember: any, factMember: any): boolean;
/**
 * Return true if the two atoms are either both variables, or
 * identical URIs.
 * @returns {boolean}
 */
export declare function similarAtoms(atom1: any, atom2: any): boolean;
/**
 * Checks if a set of facts is a subset of another set of facts.
 * @param fs1 the superset
 * @param fs2 the potential subset
 */
export declare function containsFacts(fs1: any, fs2: any): boolean;
/**
 * Substracts each set.
 * Not to be used in tag-based reasoning.
 * @param _set1
 * @param _set2
 * @returns {Array}
 */
export declare function minus(_set1: any, _set2: any): any[];
/**
 * Checks if a string is a variable,
 * @param str
 * @returns {boolean}
 */
export declare function isVariable(str: any): boolean;
export declare function updateValidTags(kb: any, additions: any, deletions: any): {
    new: any[];
    resolved: any[];
};
export declare function addAlternativeDerivationAsCausedByFromExplicit(kb: any, { consequences }: {
    consequences: any;
}, altFact: any): void;
export declare function buildCauses(conjunction: any): any;
export declare function addConsequences(facts: any, consequences: any): void;
export declare function combineImplicitCauses(implicitFacts: any): any;
export declare function disjunctCauses(prev: any, next: any): any[];
export declare function unifyFactSet(fs: any): any[];
export declare function unify(subSet: any, updatingSet: any): boolean;
export declare function uniquesCausedBy(cb1: any, cb2: any): any[];
export declare function parseRules(strRuleList: any, entailment?: string): any[];
export declare function parseRule(strRule: any, name: string, entailment: any): Rule;
export declare function _createFactSetFromTriples(triples: any): any[];
export declare function isBNode(elem: any): boolean;
export declare function skolemize(facts: any, elem: any): any;
