"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorQueryOperationDistinctHash = void 0;
const actor_abstract_bindings_hash_1 = require("@comunica/actor-abstract-bindings-hash");
/**
 * A comunica Distinct Hash Query Operation Actor.
 */
class ActorQueryOperationDistinctHash extends actor_abstract_bindings_hash_1.AbstractBindingsHash {
    constructor(args) {
        super(args, 'distinct');
    }
    /**
       * Create a new distinct filter function for the given hash algorithm and digest algorithm.
       * This will maintain an internal hash datastructure so that every bindings object only returns true once.
       * @return {(bindings: Bindings) => boolean} A distinct filter for bindings.
       */
    newHashFilter() {
        const hashes = {};
        return (bindings) => {
            const hash = actor_abstract_bindings_hash_1.AbstractFilterHash.hash(bindings);
            // eslint-disable-next-line no-return-assign
            return !(hash in hashes) && (hashes[hash] = true);
        };
    }
}
exports.ActorQueryOperationDistinctHash = ActorQueryOperationDistinctHash;
//# sourceMappingURL=ActorQueryOperationDistinctHash.js.map