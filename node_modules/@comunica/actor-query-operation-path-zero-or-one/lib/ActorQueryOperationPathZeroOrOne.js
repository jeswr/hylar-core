"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorQueryOperationPathZeroOrOne = void 0;
const ActorAbstractPath_1 = require("@comunica/actor-abstract-path/lib/ActorAbstractPath");
const bus_query_operation_1 = require("@comunica/bus-query-operation");
const asynciterator_1 = require("asynciterator");
const rdf_string_1 = require("rdf-string");
const sparqlalgebrajs_1 = require("sparqlalgebrajs");
/**
 * A comunica Path ZeroOrOne Query Operation Actor.
 */
class ActorQueryOperationPathZeroOrOne extends ActorAbstractPath_1.ActorAbstractPath {
    constructor(args) {
        super(args, sparqlalgebrajs_1.Algebra.types.ZERO_OR_ONE_PATH);
    }
    async runOperation(path, context) {
        const predicate = path.predicate;
        const sVar = path.subject.termType === 'Variable';
        const oVar = path.object.termType === 'Variable';
        const extra = [];
        // Both subject and object non-variables
        if (!sVar && !oVar) {
            if (path.subject.equals(path.object)) {
                return {
                    type: 'bindings',
                    bindingsStream: new asynciterator_1.SingletonIterator(bus_query_operation_1.Bindings({})),
                    variables: [],
                    canContainUndefs: false,
                };
            }
        }
        if (sVar && oVar) {
            throw new Error('ZeroOrOne path expressions with 2 variables not supported yet');
        }
        const distinct = await this.isPathArbitraryLengthDistinct(context, path);
        if (distinct.operation) {
            return distinct.operation;
        }
        context = distinct.context;
        if (sVar) {
            extra.push(bus_query_operation_1.Bindings({ [rdf_string_1.termToString(path.subject)]: path.object }));
        }
        if (oVar) {
            extra.push(bus_query_operation_1.Bindings({ [rdf_string_1.termToString(path.object)]: path.subject }));
        }
        const single = bus_query_operation_1.ActorQueryOperation.getSafeBindings(await this.mediatorQueryOperation.mediate({
            context,
            operation: ActorAbstractPath_1.ActorAbstractPath.FACTORY.createPath(path.subject, predicate.path, path.object, path.graph),
        }));
        const bindingsStream = single.bindingsStream.prepend(extra);
        return { type: 'bindings', bindingsStream, variables: single.variables, canContainUndefs: false };
    }
}
exports.ActorQueryOperationPathZeroOrOne = ActorQueryOperationPathZeroOrOne;
//# sourceMappingURL=ActorQueryOperationPathZeroOrOne.js.map