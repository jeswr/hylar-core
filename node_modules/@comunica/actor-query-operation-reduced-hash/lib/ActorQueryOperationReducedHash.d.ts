import type { IActorInitRdfDereferencePagedArgs } from '@comunica/actor-abstract-bindings-hash';
import { AbstractBindingsHash } from '@comunica/actor-abstract-bindings-hash';
import type { Bindings } from '@comunica/bus-query-operation';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Reduced Hash Query Operation Actor.
 */
export declare class ActorQueryOperationReducedHash extends AbstractBindingsHash<Algebra.Reduced> implements IActorInitRdfBindingHashArgs {
    readonly cacheSize: number;
    constructor(args: IActorInitRdfBindingHashArgs);
    /**
     * Create a new distinct filter function for the given hash algorithm and digest algorithm.
     * This will maintain an internal hash datastructure so that every bindings object only returns true once.
     * @return {(bindings: Bindings) => boolean} A distinct filter for bindings.
     */
    newHashFilter(): (bindings: Bindings) => boolean;
}
export interface IActorInitRdfBindingHashArgs extends IActorInitRdfDereferencePagedArgs {
    cacheSize: number;
}
