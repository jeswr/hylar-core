import type { Bindings, IActorQueryOperationOutputBindings } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated } from '@comunica/bus-query-operation';
import type { ActionContext, IActorTest } from '@comunica/core';
import type { Algebra } from 'sparqlalgebrajs';
import type { IActorInitRdfDereferencePagedArgs } from './AbstractFilterHash';
/**
 * A comunica Hash Query Operation Actor.
 */
export declare abstract class AbstractBindingsHash<T extends Algebra.Operation> extends ActorQueryOperationTypedMediated<T> implements IActorInitRdfDereferencePagedArgs {
    constructor(args: IActorInitRdfDereferencePagedArgs, operator: string);
    /**
       * Create a new filter function for the given hash algorithm and digest algorithm.
       * The given filter depends on the Algebraic operation
       * @return {(bindings: Bindings) => boolean} A distinct filter for bindings.
       */
    abstract newHashFilter(): (bindings: Bindings) => boolean;
    testOperation(pattern: T, context: ActionContext): Promise<IActorTest>;
    runOperation(pattern: T, context: ActionContext): Promise<IActorQueryOperationOutputBindings>;
}
