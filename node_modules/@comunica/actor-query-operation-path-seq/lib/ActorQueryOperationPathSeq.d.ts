import { ActorAbstractPath } from '@comunica/actor-abstract-path';
import type { IActorQueryOperationOutput, IActorQueryOperationOutputBindings, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import type { ActorRdfJoin, IActionRdfJoin } from '@comunica/bus-rdf-join';
import type { ActionContext, Mediator } from '@comunica/core';
import type { IMediatorTypeIterations } from '@comunica/mediatortype-iterations';
import { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Path Seq Query Operation Actor.
 */
export declare class ActorQueryOperationPathSeq extends ActorAbstractPath {
    readonly mediatorJoin: Mediator<ActorRdfJoin, IActionRdfJoin, IMediatorTypeIterations, IActorQueryOperationOutput>;
    constructor(args: IActorQueryOperationPathSeq);
    runOperation(path: Algebra.Path, context: ActionContext): Promise<IActorQueryOperationOutputBindings>;
}
export interface IActorQueryOperationPathSeq extends IActorQueryOperationTypedMediatedArgs {
    mediatorJoin: Mediator<ActorRdfJoin, IActionRdfJoin, IMediatorTypeIterations, IActorQueryOperationOutput>;
}
