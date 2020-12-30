"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractFilterHash = void 0;
const bus_query_operation_1 = require("@comunica/bus-query-operation");
const hash_js_1 = require("hash.js");
const rdf_string_1 = require("rdf-string");
/**
 * A comunica Hash Query Operation Actor.
 */
class AbstractFilterHash extends bus_query_operation_1.ActorQueryOperationTypedMediated {
    constructor(args, operator) {
        super(args, operator);
    }
    /**
     * Create a string-based hash of the given object.
     * @param bindings The bindings to hash.
     * @return {string} The object's hash.
     */
    static hash(bindings) {
        return hash_js_1.sha1()
            .update(require('canonicalize')(bindings.map(x => rdf_string_1.termToString(x))))
            .digest('hex');
    }
}
exports.AbstractFilterHash = AbstractFilterHash;
//# sourceMappingURL=AbstractFilterHash.js.map