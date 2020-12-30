"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorQueryOperationMinus = void 0;
const bus_query_operation_1 = require("@comunica/bus-query-operation");
const asynciterator_1 = require("asynciterator");
const BindingsIndex_1 = require("./BindingsIndex");
/**
 * A comunica Minus Query Operation Actor.
 */
class ActorQueryOperationMinus extends bus_query_operation_1.ActorQueryOperationTypedMediated {
    constructor(args) {
        super(args, 'minus');
    }
    async testOperation(operation, context) {
        return true;
    }
    async runOperation(pattern, context) {
        const buffer = bus_query_operation_1.ActorQueryOperation.getSafeBindings(await this.mediatorQueryOperation.mediate({ operation: pattern.right, context }));
        const output = bus_query_operation_1.ActorQueryOperation.getSafeBindings(await this.mediatorQueryOperation.mediate({ operation: pattern.left, context }));
        const commons = this.getCommonVariables(buffer.variables, output.variables);
        if (commons.length > 0) {
            /**
             * To assure we've filtered all B (`buffer`) values from A (`output`) we wait until we've fetched all values of B.
             * Then we save these triples in `index` and use it to filter our A-stream.
             */
            const index = new BindingsIndex_1.BindingsIndex(commons);
            const bindingsStream = new asynciterator_1.TransformIterator(async () => {
                await new Promise(resolve => {
                    buffer.bindingsStream.on('data', data => index.add(data));
                    buffer.bindingsStream.on('end', resolve);
                });
                return output.bindingsStream.filter(data => !index.contains(data));
            }, { autoStart: false });
            const canContainUndefs = buffer.canContainUndefs || output.canContainUndefs;
            return {
                type: 'bindings',
                bindingsStream,
                variables: output.variables,
                metadata: output.metadata,
                canContainUndefs,
            };
        }
        return output;
    }
    /**
     * This function puts all common values between 2 arrays in a map with `value` : true
     */
    getCommonVariables(array1, array2) {
        return Object.keys(array1.filter((value) => array2.includes(value)).reduce((hash, key) => {
            hash[key] = true;
            return hash;
        }, {}));
    }
}
exports.ActorQueryOperationMinus = ActorQueryOperationMinus;
//# sourceMappingURL=ActorQueryOperationMinus.js.map