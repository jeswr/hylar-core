"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractBindingsHash = void 0;
const bus_query_operation_1 = require("@comunica/bus-query-operation");
/**
 * A comunica Hash Query Operation Actor.
 */
class AbstractBindingsHash extends bus_query_operation_1.ActorQueryOperationTypedMediated {
    constructor(args, operator) {
        super(args, operator);
    }
    async testOperation(pattern, context) {
        return true;
    }
    async runOperation(pattern, context) {
        const output = bus_query_operation_1.ActorQueryOperation.getSafeBindings(await this.mediatorQueryOperation.mediate({ operation: pattern.input, context }));
        const bindingsStream = output.bindingsStream.filter(this.newHashFilter());
        return {
            type: 'bindings',
            bindingsStream,
            metadata: output.metadata,
            variables: output.variables,
            canContainUndefs: output.canContainUndefs,
        };
    }
}
exports.AbstractBindingsHash = AbstractBindingsHash;
//# sourceMappingURL=AbstractBindingsHash.js.map