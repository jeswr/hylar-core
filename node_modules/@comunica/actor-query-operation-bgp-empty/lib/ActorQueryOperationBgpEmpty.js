"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorQueryOperationBgpEmpty = void 0;
const bus_query_operation_1 = require("@comunica/bus-query-operation");
const asynciterator_1 = require("asynciterator");
const rdf_string_1 = require("rdf-string");
const rdf_terms_1 = require("rdf-terms");
/**
 * A comunica Query Operation Actor for empty BGPs.
 */
class ActorQueryOperationBgpEmpty extends bus_query_operation_1.ActorQueryOperationTyped {
    constructor(args) {
        super(args, 'bgp');
    }
    /**
     * Get all variables in the given patterns.
     * No duplicates are returned.
     * @param {Algebra.Pattern} patterns Quad patterns.
     * @return {string[]} The variables in this pattern, with '?' prefix.
     */
    static getVariables(patterns) {
        return rdf_terms_1.uniqTerms(patterns
            .map(pattern => rdf_terms_1.getTerms(pattern)
            .filter(term => term.termType === 'Variable'))
            .reduce((acc, val) => acc.concat(val), []))
            .map(x => rdf_string_1.termToString(x));
    }
    async testOperation(pattern, context) {
        if (pattern.patterns.length > 0) {
            throw new Error(`Actor ${this.name} can only operate on empty BGPs.`);
        }
        return true;
    }
    async runOperation(pattern, context) {
        return {
            bindingsStream: new asynciterator_1.SingletonIterator(bus_query_operation_1.Bindings({})),
            metadata: () => Promise.resolve({ totalItems: 1 }),
            type: 'bindings',
            variables: ActorQueryOperationBgpEmpty.getVariables(pattern.patterns),
            canContainUndefs: false,
        };
    }
}
exports.ActorQueryOperationBgpEmpty = ActorQueryOperationBgpEmpty;
//# sourceMappingURL=ActorQueryOperationBgpEmpty.js.map