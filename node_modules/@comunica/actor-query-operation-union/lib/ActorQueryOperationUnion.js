"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorQueryOperationUnion = void 0;
const bus_query_operation_1 = require("@comunica/bus-query-operation");
const asynciterator_1 = require("asynciterator");
/**
 * A comunica Union Query Operation Actor.
 */
class ActorQueryOperationUnion extends bus_query_operation_1.ActorQueryOperationTypedMediated {
    constructor(args) {
        super(args, 'union');
    }
    /**
     * Takes the union of the given double array variables.
     * Uniqueness is guaranteed.
     * @param {string[][]} variables Double array of variables to take the union of.
     * @return {string[]} The union of the given variables.
     */
    static unionVariables(variables) {
        const withDuplicates = variables.reduce((acc, it) => [...acc, ...it], []);
        return [...new Set(withDuplicates)];
    }
    /**
     * Takes the union of the given metadata array.
     * It will ensure that the totalItems metadata value is properly calculated.
     * @param {{[p: string]: any}[]} metadatas Array of metadata.
     * @return {{[p: string]: any}} Union of the metadata.
     */
    static unionMetadata(metadatas) {
        let totalItems = 0;
        for (const metadata of metadatas) {
            if (metadata.totalItems && Number.isFinite(metadata.totalItems)) {
                totalItems += metadata.totalItems;
            }
            else {
                totalItems = Infinity;
                break;
            }
        }
        return { totalItems };
    }
    async testOperation(pattern, context) {
        return true;
    }
    async runOperation(pattern, context) {
        const outputs = (await Promise.all([
            this.mediatorQueryOperation.mediate({ operation: pattern.left, context }),
            this.mediatorQueryOperation.mediate({ operation: pattern.right, context }),
        ])).map(bus_query_operation_1.ActorQueryOperation.getSafeBindings);
        const bindingsStream = new asynciterator_1.UnionIterator(outputs.map((output) => output.bindingsStream), { autoStart: false });
        const metadata = outputs[0].metadata && outputs[1].metadata ?
            () => Promise.all([
                outputs[0].metadata(),
                outputs[1].metadata(),
            ]).then(ActorQueryOperationUnion.unionMetadata) :
            undefined;
        const variables = ActorQueryOperationUnion.unionVariables(outputs.map((output) => output.variables));
        const canContainUndefs = outputs.reduce((acc, val) => acc || val.canContainUndefs, false);
        return { type: 'bindings', bindingsStream, metadata, variables, canContainUndefs };
    }
}
exports.ActorQueryOperationUnion = ActorQueryOperationUnion;
//# sourceMappingURL=ActorQueryOperationUnion.js.map