import type { Bindings, IActorQueryOperationOutputBindings, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated } from '@comunica/bus-query-operation';
import type { ActionContext } from '@comunica/core';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Hash Query Operation Actor.
 */
export declare abstract class AbstractFilterHash<T extends Algebra.Operation> extends ActorQueryOperationTypedMediated<T> implements IActorInitRdfDereferencePagedArgs {
    constructor(args: IActorInitRdfDereferencePagedArgs, operator: string);
    /**
     * Create a string-based hash of the given object.
     * @param bindings The bindings to hash.
     * @return {string} The object's hash.
     */
    static hash(bindings: Bindings): string;
    abstract runOperation(pattern: T, context: ActionContext): Promise<IActorQueryOperationOutputBindings>;
}
export interface IActorInitRdfDereferencePagedArgs extends IActorQueryOperationTypedMediatedArgs {
}
