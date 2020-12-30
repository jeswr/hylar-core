"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorRdfJoinSymmetricHash = void 0;
const bus_query_operation_1 = require("@comunica/bus-query-operation");
const bus_rdf_join_1 = require("@comunica/bus-rdf-join");
const asyncjoin_1 = require("asyncjoin");
/**
 * A comunica Hash RDF Join Actor.
 */
class ActorRdfJoinSymmetricHash extends bus_rdf_join_1.ActorRdfJoin {
    constructor(args) {
        super(args, 2);
    }
    /**
     * Creates a hash of the given bindings by concatenating the results of the given variables.
     * This function will not sort the variables and expects them to be in the same order for every call.
     * @param {Bindings} bindings
     * @param {string[]} variables
     * @returns {string}
     */
    static hash(bindings, variables) {
        return variables.filter(variable => bindings.has(variable)).map(variable => bindings.get(variable).value).join('');
    }
    async getOutput(action) {
        const variables = bus_rdf_join_1.ActorRdfJoin.overlappingVariables(action);
        const join = new asyncjoin_1.SymmetricHashJoin(action.entries[0].bindingsStream, action.entries[1].bindingsStream, entry => ActorRdfJoinSymmetricHash.hash(entry, variables), bus_rdf_join_1.ActorRdfJoin.join);
        return {
            type: 'bindings',
            bindingsStream: join,
            variables: bus_rdf_join_1.ActorRdfJoin.joinVariables(action),
            canContainUndefs: false,
        };
    }
    async getIterations(action) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        return (await bus_query_operation_1.getMetadata(action.entries[0])).totalItems + (await bus_query_operation_1.getMetadata(action.entries[1])).totalItems;
    }
}
exports.ActorRdfJoinSymmetricHash = ActorRdfJoinSymmetricHash;
//# sourceMappingURL=ActorRdfJoinSymmetricHash.js.map