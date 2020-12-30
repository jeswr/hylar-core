import type { IActorQueryOperationOutputBindings, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated } from '@comunica/bus-query-operation';
import type { ActionContext, IActorTest } from '@comunica/core';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Filter Sparqlee Query Operation Actor.
 */
export declare class ActorQueryOperationFilterSparqlee extends ActorQueryOperationTypedMediated<Algebra.Filter> {
    constructor(args: IActorQueryOperationTypedMediatedArgs);
    testOperation(pattern: Algebra.Filter, context: ActionContext): Promise<IActorTest>;
    runOperation(pattern: Algebra.Filter, context: ActionContext): Promise<IActorQueryOperationOutputBindings>;
}
