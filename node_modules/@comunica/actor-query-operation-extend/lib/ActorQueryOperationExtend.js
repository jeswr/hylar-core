"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorQueryOperationExtend = void 0;
const bus_query_operation_1 = require("@comunica/bus-query-operation");
const rdf_string_1 = require("rdf-string");
const sparqlee_1 = require("sparqlee");
/**
 * A comunica Extend Query Operation Actor.
 *
 * See https://www.w3.org/TR/sparql11-query/#sparqlAlgebra;
 */
class ActorQueryOperationExtend extends bus_query_operation_1.ActorQueryOperationTypedMediated {
    constructor(args) {
        super(args, 'extend');
    }
    async testOperation(pattern, context) {
        // Will throw error for unsupported opperations
        const _ = Boolean(new sparqlee_1.AsyncEvaluator(pattern.expression));
        return true;
    }
    async runOperation(pattern, context) {
        const { expression, input, variable } = pattern;
        const output = bus_query_operation_1.ActorQueryOperation.getSafeBindings(await this.mediatorQueryOperation.mediate({ operation: input, context }));
        const extendKey = rdf_string_1.termToString(variable);
        const config = Object.assign({}, bus_query_operation_1.ActorQueryOperation.getExpressionContext(context, this.mediatorQueryOperation));
        const evaluator = new sparqlee_1.AsyncEvaluator(expression, config);
        // Transform the stream by extending each Bindings with the expression result
        const transform = async (bindings, next, push) => {
            try {
                const result = await evaluator.evaluate(bindings);
                // Extend operation is undefined when the key already exists
                // We just override it here.
                const extended = bindings.set(extendKey, result);
                push(extended);
            }
            catch (error) {
                if (sparqlee_1.isExpressionError(error)) {
                    // Errors silently don't actually extend according to the spec
                    push(bindings);
                    // But let's warn anyway
                    this.logWarn(context, `Expression error for extend operation with bindings '${JSON.stringify(bindings)}'`);
                }
                else {
                    bindingsStream.emit('error', error);
                }
            }
            next();
        };
        const variables = output.variables.concat([extendKey]);
        const bindingsStream = output.bindingsStream.transform({ transform });
        const { metadata } = output;
        return { type: 'bindings', bindingsStream, metadata, variables, canContainUndefs: output.canContainUndefs };
    }
}
exports.ActorQueryOperationExtend = ActorQueryOperationExtend;
//# sourceMappingURL=ActorQueryOperationExtend.js.map