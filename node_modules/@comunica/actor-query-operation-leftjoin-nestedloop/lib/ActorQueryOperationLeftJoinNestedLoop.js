"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorQueryOperationLeftJoinNestedLoop = void 0;
const bus_query_operation_1 = require("@comunica/bus-query-operation");
const bus_rdf_join_1 = require("@comunica/bus-rdf-join");
const sparqlee_1 = require("sparqlee");
/**
 * A comunica LeftJoin NestedLoop Query Operation Actor.
 */
class ActorQueryOperationLeftJoinNestedLoop extends bus_query_operation_1.ActorQueryOperationTypedMediated {
    constructor(args) {
        super(args, 'leftjoin');
    }
    async testOperation(pattern, context) {
        return true;
    }
    async runOperation(pattern, context) {
        const leftRaw = await this.mediatorQueryOperation.mediate({ operation: pattern.left, context });
        const left = bus_query_operation_1.ActorQueryOperation.getSafeBindings(leftRaw);
        const rightRaw = await this.mediatorQueryOperation.mediate({ operation: pattern.right, context });
        const right = bus_query_operation_1.ActorQueryOperation.getSafeBindings(rightRaw);
        // TODO: refactor custom handling of pattern.expression. Should be pushed on the bus instead as a filter operation.
        const config = Object.assign({}, bus_query_operation_1.ActorQueryOperation.getExpressionContext(context));
        const evaluator = pattern.expression ?
            new sparqlee_1.AsyncEvaluator(pattern.expression, config) :
            null;
        const leftJoinInner = (outerItem, innerStream) => innerStream
            .transform({
            async transform(innerItem, nextInner, push) {
                const joinedBindings = bus_rdf_join_1.ActorRdfJoin.join(outerItem, innerItem);
                if (!joinedBindings) {
                    nextInner();
                    return;
                }
                if (!evaluator) {
                    push({ joinedBindings, result: true });
                    nextInner();
                    return;
                }
                try {
                    const result = await evaluator.evaluateAsEBV(joinedBindings);
                    push({ joinedBindings, result });
                }
                catch (error) {
                    if (!sparqlee_1.isExpressionError(error)) {
                        bindingsStream.emit('error', error);
                    }
                }
                nextInner();
            },
        });
        const leftJoinOuter = (leftItem, nextLeft, push) => {
            const innerStream = right.bindingsStream.clone();
            const joinedStream = leftJoinInner(leftItem, innerStream);
            // TODO: This will not work for larger streams.
            // The full inner stream is kept in memory.
            joinedStream.on('end', () => nextLeft());
            joinedStream.on('data', async ({ joinedBindings, result }) => {
                if (result) {
                    push(joinedBindings);
                }
            });
        };
        const transform = leftJoinOuter;
        const bindingsStream = left.bindingsStream
            .transform({ optional: true, transform });
        const variables = bus_rdf_join_1.ActorRdfJoin.joinVariables({ entries: [left, right] });
        const metadata = () => Promise.all([left, right].map(x => bus_query_operation_1.getMetadata(x)))
            .then(metadatas => metadatas.reduce((acc, val) => acc * val.totalItems, 1))
            .catch(() => Infinity)
            .then(totalItems => ({ totalItems }));
        return { type: 'bindings', bindingsStream, metadata, variables, canContainUndefs: true };
    }
}
exports.ActorQueryOperationLeftJoinNestedLoop = ActorQueryOperationLeftJoinNestedLoop;
//# sourceMappingURL=ActorQueryOperationLeftJoinNestedLoop.js.map