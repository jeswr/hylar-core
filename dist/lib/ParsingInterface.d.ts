import Fact from './Logics/Fact';
/**
 * The parsing interface, for transforming facts, triples, turtle or even results bindings
 * into other representations.
 * The SPARQL parser oddly transforms prefixed typed literal without angle brackets (!).
 * This should fix it.
 */
/**
  * Transforms a triple into a fact.
  * @param t The triple
  * @param explicit True if the resulting fact is explicit, false otherwise (default: true)
  * @returns Object resulting fact
  */
export declare function tripleToFact(t: any, explicit?: boolean): Fact;
export declare function triplesToFacts(t: any, explicit?: boolean, notUsingValid?: boolean): any;
export declare function factsToQuads(facts: Fact[]): {
    implicit: any[];
    explicit: any[];
};
