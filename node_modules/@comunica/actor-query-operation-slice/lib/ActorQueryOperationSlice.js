"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorQueryOperationSlice = void 0;
const bus_query_operation_1 = require("@comunica/bus-query-operation");
/**
 * A comunica Slice Query Operation Actor.
 */
class ActorQueryOperationSlice extends bus_query_operation_1.ActorQueryOperationTypedMediated {
    constructor(args) {
        super(args, 'slice');
    }
    async testOperation(pattern, context) {
        return true;
    }
    async runOperation(pattern, context) {
        // Resolve the input
        const output = await this.mediatorQueryOperation
            .mediate({ operation: pattern.input, context });
        const metadata = this.sliceMetadata(output, pattern);
        if (output.type === 'bindings') {
            const bindingsOutput = output;
            const bindingsStream = this.sliceStream(bindingsOutput.bindingsStream, pattern);
            return {
                type: 'bindings',
                bindingsStream,
                metadata,
                variables: bindingsOutput.variables,
                canContainUndefs: bindingsOutput.canContainUndefs,
            };
        }
        if (output.type === 'quads') {
            const quadOutput = output;
            const quadStream = this.sliceStream(quadOutput.quadStream, pattern);
            return { type: 'quads', quadStream, metadata };
        }
        throw new Error(`Invalid query output type: Expected 'bindings' or 'quads' but got '${output.type}'`);
    }
    // Slice the stream based on the pattern values
    sliceStream(stream, pattern) {
        const hasLength = Boolean(pattern.length) || pattern.length === 0;
        const { start } = pattern;
        const end = hasLength ? pattern.start + pattern.length - 1 : Infinity;
        return stream.transform({ offset: start, limit: Math.max(end - start + 1, 0), autoStart: false });
    }
    // If we find metadata, apply slicing on the total number of items
    sliceMetadata(output, pattern) {
        const hasLength = Boolean(pattern.length) || pattern.length === 0;
        return !output.metadata ?
            undefined :
            () => output.metadata()
                .then(subMetadata => {
                let { totalItems } = subMetadata;
                if (Number.isFinite(totalItems)) {
                    totalItems = Math.max(0, totalItems - pattern.start);
                    if (hasLength) {
                        totalItems = Math.min(totalItems, pattern.length);
                    }
                }
                return Object.assign(Object.assign({}, subMetadata), { totalItems });
            });
    }
}
exports.ActorQueryOperationSlice = ActorQueryOperationSlice;
//# sourceMappingURL=ActorQueryOperationSlice.js.map