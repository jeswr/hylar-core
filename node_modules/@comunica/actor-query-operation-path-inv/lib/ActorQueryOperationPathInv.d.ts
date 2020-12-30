import { ActorAbstractPath } from '@comunica/actor-abstract-path';
import type { IActorQueryOperationOutput, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import type { ActionContext } from '@comunica/core';
import { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Path Inv Query Operation Actor.
 */
export declare class ActorQueryOperationPathInv extends ActorAbstractPath {
    constructor(args: IActorQueryOperationTypedMediatedArgs);
    runOperation(path: Algebra.Path, context: ActionContext): Promise<IActorQueryOperationOutput>;
}
