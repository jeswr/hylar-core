"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorRdfJoinNestedLoop = void 0;
const bus_query_operation_1 = require("@comunica/bus-query-operation");
const bus_rdf_join_1 = require("@comunica/bus-rdf-join");
const asyncjoin_1 = require("asyncjoin");
/**
 * A comunica NestedLoop RDF Join Actor.
 */
class ActorRdfJoinNestedLoop extends bus_rdf_join_1.ActorRdfJoin {
    constructor(args) {
        super(args, 2, undefined, true);
    }
    async getOutput(action) {
        const join = new asyncjoin_1.NestedLoopJoin(action.entries[0].bindingsStream, action.entries[1].bindingsStream, bus_rdf_join_1.ActorRdfJoin.join, { autoStart: false });
        return {
            type: 'bindings',
            bindingsStream: join,
            variables: bus_rdf_join_1.ActorRdfJoin.joinVariables(action),
            canContainUndefs: action.entries.reduce((acc, val) => acc || val.canContainUndefs, false),
        };
    }
    async getIterations(action) {
        return (await bus_query_operation_1.getMetadata(action.entries[0])).totalItems * (await bus_query_operation_1.getMetadata(action.entries[1])).totalItems;
    }
}
exports.ActorRdfJoinNestedLoop = ActorRdfJoinNestedLoop;
//# sourceMappingURL=ActorRdfJoinNestedLoop.js.map