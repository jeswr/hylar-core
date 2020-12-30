import type { IActorQueryOperationOutputBindings, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated } from '@comunica/bus-query-operation';
import type { ActionContext, IActorTest } from '@comunica/core';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Extend Query Operation Actor.
 *
 * See https://www.w3.org/TR/sparql11-query/#sparqlAlgebra;
 */
export declare class ActorQueryOperationExtend extends ActorQueryOperationTypedMediated<Algebra.Extend> {
    constructor(args: IActorQueryOperationTypedMediatedArgs);
    testOperation(pattern: Algebra.Extend, context: ActionContext): Promise<IActorTest>;
    runOperation(pattern: Algebra.Extend, context: ActionContext): Promise<IActorQueryOperationOutputBindings>;
}
