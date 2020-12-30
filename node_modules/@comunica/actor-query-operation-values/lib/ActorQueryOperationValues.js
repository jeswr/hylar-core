"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorQueryOperationValues = void 0;
const bus_query_operation_1 = require("@comunica/bus-query-operation");
const asynciterator_1 = require("asynciterator");
const rdf_string_1 = require("rdf-string");
/**
 * A comunica Values Query Operation Actor.
 */
class ActorQueryOperationValues extends bus_query_operation_1.ActorQueryOperationTyped {
    constructor(args) {
        super(args, 'values');
    }
    async testOperation(pattern, context) {
        return true;
    }
    async runOperation(pattern, context) {
        const bindingsStream = new asynciterator_1.ArrayIterator(pattern.bindings.map(x => bus_query_operation_1.Bindings(x)));
        const metadata = () => Promise.resolve({ totalItems: pattern.bindings.length });
        const variables = pattern.variables.map(x => rdf_string_1.termToString(x));
        const canContainUndefs = pattern.bindings.some(bindings => variables.some(variable => !(variable in bindings)));
        return { type: 'bindings', bindingsStream, metadata, variables, canContainUndefs };
    }
}
exports.ActorQueryOperationValues = ActorQueryOperationValues;
//# sourceMappingURL=ActorQueryOperationValues.js.map