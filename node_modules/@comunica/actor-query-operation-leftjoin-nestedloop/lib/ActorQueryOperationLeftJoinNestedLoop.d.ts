import type { IActorQueryOperationOutputBindings, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated } from '@comunica/bus-query-operation';
import type { ActionContext, IActorTest } from '@comunica/core';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica LeftJoin NestedLoop Query Operation Actor.
 */
export declare class ActorQueryOperationLeftJoinNestedLoop extends ActorQueryOperationTypedMediated<Algebra.LeftJoin> {
    constructor(args: IActorQueryOperationTypedMediatedArgs);
    testOperation(pattern: Algebra.LeftJoin, context: ActionContext): Promise<IActorTest>;
    runOperation(pattern: Algebra.LeftJoin, context: ActionContext): Promise<IActorQueryOperationOutputBindings>;
}
