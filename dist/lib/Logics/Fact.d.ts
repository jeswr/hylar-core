/**
 * Created by mt on 21/12/2015.
 */
/**
 * Fact in the form subClassOf(a, b)
 * @param pred fact's/axiom name (e.g. subClassOf)
 * @param sub left individual
 * @param obj right individual
 * @param originFacts array of facts causing this
 * @constructor
 */
export default class Fact {
    falseFact: string;
    matches: {};
    predicate: any;
    subject: any;
    object: any;
    consequences: any[];
    fromTriple: any;
    causedBy: any[];
    explicit: boolean;
    graphs: any[];
    valid: boolean;
    constants: any[];
    operatorPredicate: boolean;
    asString: any;
    __propagate__: any;
    rule: any;
    constructor(pred: any, sub: any, obj: any, causes?: any[], expl?: boolean, graphs?: any[], consequences?: any[], notUsingValidity?: any, fromTriple?: any);
    /**
     * Convenient method to stringify a fact.
     * @returns {string}
     */
    asPlainString(): string;
    toString(): any;
    toCHR(mapping: any): any;
    toRaw(): any;
    subjectCHR(mapping: any): any;
    predicateCHR(mapping: any): any;
    objectCHR(mapping: any): any;
    truncatedString(): string;
    /**
     * Checks if the fact is equivalent to another fact.
     * @param fact
     * @returns {boolean}
     */
    equivalentTo({ explicit, subject, predicate, object, }: {
        explicit: any;
        subject: any;
        predicate: any;
        object: any;
    }): boolean;
    hasSimilarPatternWith({ subject, predicate, object }: {
        subject: any;
        predicate: any;
        object: any;
    }): boolean;
    /**
     * Returns the fact if it appears in a set of facts.
     * Returns false otherwise.
     * @param factSet
     */
    appearsIn(factSet: any): string | false;
    /**
     * Checks the validity of an implicit fact
     * by exploring its explicit causes' validity tags.
     * An implicit fact is valid iff the disjunction of
     * its explicit causes' validity tags is true, i.e.
     * if at least one of its causes is valid.
     * @param fe
     * @returns {boolean}
     */
    isValid(): any;
    derives(kb: any): any[];
    doPropagate(keptFact: any): void;
}
