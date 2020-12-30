import type { IActorQueryOperationOutputBoolean, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated } from '@comunica/bus-query-operation';
import type { ActionContext, IActorTest } from '@comunica/core';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Ask Query Operation Actor.
 */
export declare class ActorQueryOperationAsk extends ActorQueryOperationTypedMediated<Algebra.Ask> {
    constructor(args: IActorQueryOperationTypedMediatedArgs);
    testOperation(pattern: Algebra.Ask, context: ActionContext): Promise<IActorTest>;
    runOperation(pattern: Algebra.Ask, context: ActionContext): Promise<IActorQueryOperationOutputBoolean>;
}
