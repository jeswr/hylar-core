import { ActorAbstractPath } from '@comunica/actor-abstract-path/lib/ActorAbstractPath';
import type { IActorQueryOperationOutputBindings, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import type { ActionContext } from '@comunica/core';
import { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Path ZeroOrOne Query Operation Actor.
 */
export declare class ActorQueryOperationPathZeroOrOne extends ActorAbstractPath {
    constructor(args: IActorQueryOperationTypedMediatedArgs);
    runOperation(path: Algebra.Path, context: ActionContext): Promise<IActorQueryOperationOutputBindings>;
}
