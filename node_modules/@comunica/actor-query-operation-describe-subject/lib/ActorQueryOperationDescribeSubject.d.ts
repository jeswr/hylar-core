import type { IActorQueryOperationOutputQuads, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated } from '@comunica/bus-query-operation';
import type { ActionContext, IActorTest } from '@comunica/core';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Describe Subject Query Operation Actor.
 */
export declare class ActorQueryOperationDescribeSubject extends ActorQueryOperationTypedMediated<Algebra.Describe> {
    constructor(args: IActorQueryOperationTypedMediatedArgs);
    testOperation(pattern: Algebra.Describe, context: ActionContext): Promise<IActorTest>;
    runOperation(pattern: Algebra.Describe, context: ActionContext): Promise<IActorQueryOperationOutputQuads>;
}
