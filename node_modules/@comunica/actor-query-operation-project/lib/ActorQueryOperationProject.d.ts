import type { IActorQueryOperationOutputBindings, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated } from '@comunica/bus-query-operation';
import type { ActionContext, IActorTest } from '@comunica/core';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Project Query Operation Actor.
 */
export declare class ActorQueryOperationProject extends ActorQueryOperationTypedMediated<Algebra.Project> {
    constructor(args: IActorQueryOperationTypedMediatedArgs);
    testOperation(pattern: Algebra.Project, context: ActionContext): Promise<IActorTest>;
    runOperation(pattern: Algebra.Project, context: ActionContext): Promise<IActorQueryOperationOutputBindings>;
}
