"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorQueryOperationDescribeSubject = void 0;
const actor_query_operation_union_1 = require("@comunica/actor-query-operation-union");
const bus_query_operation_1 = require("@comunica/bus-query-operation");
const asynciterator_1 = require("asynciterator");
const rdf_data_factory_1 = require("rdf-data-factory");
const DF = new rdf_data_factory_1.DataFactory();
/**
 * A comunica Describe Subject Query Operation Actor.
 */
class ActorQueryOperationDescribeSubject extends bus_query_operation_1.ActorQueryOperationTypedMediated {
    constructor(args) {
        super(args, 'describe');
    }
    async testOperation(pattern, context) {
        return true;
    }
    async runOperation(pattern, context) {
        // Create separate construct queries for all non-variable terms
        const operations = pattern.terms
            .filter(term => term.termType !== 'Variable')
            .map((term) => {
            // Transform each term to a separate construct operation with S ?p ?o patterns (BGP) for all terms
            const patterns = [
                DF.quad(term, DF.variable('__predicate'), DF.variable('__object')),
            ];
            // eslint-disable-next-line no-return-assign
            patterns.forEach((templatePattern) => templatePattern.type = 'pattern');
            const templateOperation = { type: 'bgp', patterns: patterns };
            // Create a construct query
            return {
                input: templateOperation,
                template: patterns,
                type: 'construct',
            };
        });
        // If we have variables in the term list,
        // create one separate construct operation to determine these variables using the input pattern.
        if (operations.length !== pattern.terms.length) {
            let variablePatterns = [];
            pattern.terms
                .filter(term => term.termType === 'Variable')
                .forEach((term, i) => {
                // Transform each term to an S ?p ?o pattern in a non-conflicting way
                const patterns = [
                    DF.quad(term, DF.variable(`__predicate${i}`), DF.variable(`__object${i}`)),
                ];
                // eslint-disable-next-line no-return-assign
                patterns.forEach((templatePattern) => templatePattern.type = 'pattern');
                variablePatterns = variablePatterns.concat(patterns);
            });
            // Add a single construct for the variables
            // This requires a join between the input pattern and our variable patterns that form a simple BGP
            operations.push({
                input: { type: 'join', left: pattern.input, right: { type: 'bgp', patterns: variablePatterns } },
                template: variablePatterns,
                type: 'construct',
            });
        }
        // Evaluate the construct queries
        const outputs = (await Promise.all(operations.map(operation => this.mediatorQueryOperation.mediate({ operation, context }))))
            .map(bus_query_operation_1.ActorQueryOperation.getSafeQuads);
        // Take the union of all quad streams
        const quadStream = new asynciterator_1.UnionIterator(outputs.map(output => output.quadStream), { autoStart: false });
        // Take union of metadata
        const metadata = () => Promise.all(outputs
            .map(x => bus_query_operation_1.getMetadata(x)))
            .then(actor_query_operation_union_1.ActorQueryOperationUnion.unionMetadata);
        return { type: 'quads', quadStream, metadata };
    }
}
exports.ActorQueryOperationDescribeSubject = ActorQueryOperationDescribeSubject;
//# sourceMappingURL=ActorQueryOperationDescribeSubject.js.map