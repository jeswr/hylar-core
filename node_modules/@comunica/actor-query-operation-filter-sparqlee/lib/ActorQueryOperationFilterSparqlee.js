"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorQueryOperationFilterSparqlee = void 0;
const bus_query_operation_1 = require("@comunica/bus-query-operation");
const sparqlee_1 = require("sparqlee");
/**
 * A comunica Filter Sparqlee Query Operation Actor.
 */
class ActorQueryOperationFilterSparqlee extends bus_query_operation_1.ActorQueryOperationTypedMediated {
    constructor(args) {
        super(args, 'filter');
    }
    async testOperation(pattern, context) {
        // Will throw error for unsupported operators
        const _ = new sparqlee_1.AsyncEvaluator(pattern.expression, bus_query_operation_1.ActorQueryOperation.getExpressionContext(context, this.mediatorQueryOperation));
        return true;
    }
    async runOperation(pattern, context) {
        const outputRaw = await this.mediatorQueryOperation.mediate({ operation: pattern.input, context });
        const output = bus_query_operation_1.ActorQueryOperation.getSafeBindings(outputRaw);
        bus_query_operation_1.ActorQueryOperation.validateQueryOutput(output, 'bindings');
        const { variables, metadata } = output;
        const config = bus_query_operation_1.ActorQueryOperation.getExpressionContext(context, this.mediatorQueryOperation);
        const evaluator = new sparqlee_1.AsyncEvaluator(pattern.expression, config);
        const transform = async (item, next, push) => {
            try {
                const result = await evaluator.evaluateAsEBV(item);
                if (result) {
                    push(item);
                }
            }
            catch (error) {
                if (!sparqlee_1.isExpressionError(error)) {
                    bindingsStream.emit('error', error);
                }
            }
            next();
        };
        const bindingsStream = output.bindingsStream.transform({ transform });
        return { type: 'bindings', bindingsStream, metadata, variables, canContainUndefs: output.canContainUndefs };
    }
}
exports.ActorQueryOperationFilterSparqlee = ActorQueryOperationFilterSparqlee;
//# sourceMappingURL=ActorQueryOperationFilterSparqlee.js.map