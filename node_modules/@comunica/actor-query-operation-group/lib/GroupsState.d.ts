import { Bindings } from '@comunica/bus-query-operation';
import type { Algebra } from 'sparqlalgebrajs';
import type { SyncEvaluatorConfig } from 'sparqlee';
import { AggregateEvaluator } from 'sparqlee';
/**
 * A simple type alias for strings that should be hashes of Bindings
 */
export declare type BindingsHash = string;
/**
 * A state container for a single group
 *
 * @property {Bindings} bindings - The binding entries on which we group
 */
export interface IGroup {
    bindings: Bindings;
    aggregators: Record<string, AggregateEvaluator>;
}
/**
 * A state manager for the groups constructed by consuming the bindings-stream.
 */
export declare class GroupsState {
    private readonly pattern;
    private readonly sparqleeConfig;
    private readonly groups;
    private readonly groupVariables;
    private readonly distinctHashes;
    constructor(pattern: Algebra.Group, sparqleeConfig: SyncEvaluatorConfig);
    /**
     * - Consumes a stream binding
     * - Find the corresponding group and create one if need be
     * - Feeds the binding to the group's aggregators
     *
     * @param {Bindings} bindings - The Bindings to consume
     */
    consumeBindings(bindings: Bindings): void;
    /**
     * Collect the result of the current state. This returns a Bindings per group,
     * and a (possibly empty) Bindings in case the no Bindings have been consumed yet.
     */
    collectResults(): Bindings[];
    /**
     * @param {Bindings} bindings - Bindings to hash
     */
    private hashBindings;
}
