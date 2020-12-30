"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorRdfJoin = void 0;
const core_1 = require("@comunica/core");
const asynciterator_1 = require("asynciterator");
/**
 * A comunica actor for joining 2 binding streams.
 *
 * Actor types:
 * * Input:  IActionRdfJoin:      The streams that need to be joined.
 * * Test:   <none>
 * * Output: IActorRdfJoinOutput: The resulting joined stream.
 *
 * @see IActionRdfJoin
 * @see IActorQueryOperationOutput
 */
class ActorRdfJoin extends core_1.Actor {
    constructor(args, limitEntries, limitEntriesMin, canHandleUndefs) {
        super(args);
        this.limitEntries = limitEntries !== null && limitEntries !== void 0 ? limitEntries : Infinity;
        this.limitEntriesMin = limitEntriesMin !== null && limitEntriesMin !== void 0 ? limitEntriesMin : false;
        this.canHandleUndefs = canHandleUndefs !== null && canHandleUndefs !== void 0 ? canHandleUndefs : false;
    }
    /**
     * Returns an array containing all the variable names that occur in all bindings streams.
     * @param {IActionRdfJoin} action
     * @returns {string[]}
     */
    static overlappingVariables(action) {
        const variables = action.entries.map(entry => entry.variables);
        let baseArray = variables[0];
        for (const array of variables.slice(1)) {
            baseArray = baseArray.filter(el => array.includes(el));
        }
        return baseArray;
    }
    /**
     * Returns the variables that will occur in the joined bindings.
     * @param {IActionRdfJoin} action
     * @returns {string[]}
     */
    static joinVariables(action) {
        const variables = action.entries.map(entry => entry.variables);
        const withDuplicates = variables.reduce((acc, it) => [...acc, ...it], []);
        return [...new Set(withDuplicates)];
    }
    /**
     * Returns the result of joining bindings, or `null` if no join is possible.
     * @param {Bindings[]} bindings
     * @returns {Bindings}
     */
    static join(...bindings) {
        try {
            return bindings.reduce((acc, val) => acc.mergeWith((left, right) => {
                if (!left.equals(right)) {
                    throw new Error('Join failure');
                }
                return left;
            }, val));
        }
        catch (_a) {
            return null;
        }
    }
    /**
     * Checks if all metadata objects are present in the action, and if they have the specified key.
     * @param {IActionRdfJoin} action
     * @param {string} key
     * @returns {boolean}
     */
    static async iteratorsHaveMetadata(action, key) {
        return Promise.all(action.entries.map(async (entry) => {
            if (!entry.metadata) {
                throw new Error('Missing metadata');
            }
            const metadata = await entry.metadata();
            if (!(key in metadata)) {
                throw new Error('Missing metadata value');
            }
        })).then(() => true).catch(() => false);
    }
    /**
     * Default test function for join actors.
     * Checks whether all iterators have metadata.
     * If yes: call the abstract getIterations method, if not: return Infinity.
     * @param {IActionRdfJoin} action The input action containing the relevant iterators
     * @returns {Promise<IMediatorTypeIterations>} The calculated estime.
     */
    async test(action) {
        // Allow joining of one or zero streams
        if (action.entries.length <= 1) {
            return { iterations: 0 };
        }
        // Check if this actor can handle the given number of streams
        if (this.limitEntriesMin ? action.entries.length < this.limitEntries : action.entries.length > this.limitEntries) {
            throw new Error(`${this.name} requires ${this.limitEntries} sources at ${this.limitEntriesMin ? 'least' : 'most'}. The input contained ${action.entries.length}.`);
        }
        // Check if all streams are bindings streams
        for (const entry of action.entries) {
            if (entry.type !== 'bindings') {
                throw new Error(`Invalid type of a join entry: Expected 'bindings' but got '${entry.type}'`);
            }
        }
        // Check if this actor can handle undefs
        if (!this.canHandleUndefs) {
            for (const entry of action.entries) {
                if (entry.canContainUndefs) {
                    throw new Error(`Actor ${this.name} can not join streams containing undefs`);
                }
            }
        }
        if (!await ActorRdfJoin.iteratorsHaveMetadata(action, 'totalItems')) {
            return { iterations: Infinity };
        }
        return { iterations: await this.getIterations(action) };
    }
    /**
     * Returns default input for 0 or 1 entries. Calls the getOutput function otherwise
     * @param {IActionRdfJoin} action
     * @returns {Promise<IActorQueryOperationOutput>}
     */
    async run(action) {
        if (action.entries.length === 0) {
            return {
                bindingsStream: new asynciterator_1.ArrayIterator([], { autoStart: false }),
                metadata: () => Promise.resolve({ totalItems: 0 }),
                type: 'bindings',
                variables: [],
                canContainUndefs: false,
            };
        }
        if (action.entries.length === 1) {
            return action.entries[0];
        }
        const result = this.getOutput(action);
        function totalItems() {
            return Promise.all(action.entries
                .map(entry => entry.metadata()))
                .then(metadatas => metadatas.reduce((acc, val) => acc * val.totalItems, 1));
        }
        if (await ActorRdfJoin.iteratorsHaveMetadata(action, 'totalItems')) {
            // Update the result promise to also add the estimated total items
            const unwrapped = await result;
            if (unwrapped.metadata) {
                const oldMetadata = unwrapped.metadata;
                unwrapped.metadata = () => oldMetadata().then(async (metadata) => {
                    // Don't overwrite metadata if it was generated by implementation
                    if (!('totalItems' in metadata)) {
                        metadata.totalItems = await totalItems();
                    }
                    return metadata;
                });
            }
            else {
                unwrapped.metadata = () => totalItems().then(totalItemsValue => ({ totalItems: totalItemsValue }));
            }
            return unwrapped;
        }
        return result;
    }
}
exports.ActorRdfJoin = ActorRdfJoin;
//# sourceMappingURL=ActorRdfJoin.js.map