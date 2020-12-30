"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorQueryOperationPathSeq = void 0;
const actor_abstract_path_1 = require("@comunica/actor-abstract-path");
const bus_query_operation_1 = require("@comunica/bus-query-operation");
const rdf_string_1 = require("rdf-string");
const sparqlalgebrajs_1 = require("sparqlalgebrajs");
/**
 * A comunica Path Seq Query Operation Actor.
 */
class ActorQueryOperationPathSeq extends actor_abstract_path_1.ActorAbstractPath {
    constructor(args) {
        super(args, sparqlalgebrajs_1.Algebra.types.SEQ);
    }
    async runOperation(path, context) {
        const predicate = path.predicate;
        const variable = this.generateVariable(path);
        const varName = rdf_string_1.termToString(variable);
        const subOperations = (await Promise.all([
            this.mediatorQueryOperation.mediate({
                context, operation: actor_abstract_path_1.ActorAbstractPath.FACTORY.createPath(path.subject, predicate.left, variable, path.graph),
            }),
            this.mediatorQueryOperation.mediate({
                context, operation: actor_abstract_path_1.ActorAbstractPath.FACTORY.createPath(variable, predicate.right, path.object, path.graph),
            }),
        ])).map(op => bus_query_operation_1.ActorQueryOperation.getSafeBindings(op));
        const join = bus_query_operation_1.ActorQueryOperation.getSafeBindings(await this.mediatorJoin.mediate({ entries: subOperations }));
        // Remove the generated variable from the bindings
        const bindingsStream = join.bindingsStream.transform({
            transform(item, next, push) {
                push(item.delete(varName));
                next();
            },
        });
        // Remove the generated variable from the list of variables
        const variables = join.variables;
        const indexOfVar = variables.indexOf(varName);
        variables.splice(indexOfVar, 1);
        return { type: 'bindings', bindingsStream, variables, canContainUndefs: false };
    }
}
exports.ActorQueryOperationPathSeq = ActorQueryOperationPathSeq;
//# sourceMappingURL=ActorQueryOperationPathSeq.js.map