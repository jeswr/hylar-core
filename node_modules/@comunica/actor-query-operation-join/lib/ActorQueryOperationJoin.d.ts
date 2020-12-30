import type { IActorQueryOperationOutput, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated } from '@comunica/bus-query-operation';
import type { ActorRdfJoin, IActionRdfJoin } from '@comunica/bus-rdf-join';
import type { ActionContext, IActorTest, Mediator } from '@comunica/core';
import type { IMediatorTypeIterations } from '@comunica/mediatortype-iterations';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Join Query Operation Actor.
 */
export declare class ActorQueryOperationJoin extends ActorQueryOperationTypedMediated<Algebra.Join> {
    readonly mediatorJoin: Mediator<ActorRdfJoin, IActionRdfJoin, IMediatorTypeIterations, IActorQueryOperationOutput>;
    constructor(args: IActorQueryOperationJoinArgs);
    testOperation(pattern: Algebra.Join, context: ActionContext): Promise<IActorTest>;
    runOperation(pattern: Algebra.Join, context: ActionContext): Promise<IActorQueryOperationOutput>;
}
export interface IActorQueryOperationJoinArgs extends IActorQueryOperationTypedMediatedArgs {
    mediatorJoin: Mediator<ActorRdfJoin, IActionRdfJoin, IMediatorTypeIterations, IActorQueryOperationOutput>;
}
