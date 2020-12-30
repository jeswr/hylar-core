import type { IActorQueryOperationOutputBindings, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated } from '@comunica/bus-query-operation';
import type { ActionContext, IActorTest } from '@comunica/core';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Group Query Operation Actor.
 */
export declare class ActorQueryOperationGroup extends ActorQueryOperationTypedMediated<Algebra.Group> {
    constructor(args: IActorQueryOperationTypedMediatedArgs);
    testOperation(pattern: Algebra.Group, context: ActionContext): Promise<IActorTest>;
    runOperation(pattern: Algebra.Group, context: ActionContext): Promise<IActorQueryOperationOutputBindings>;
}
