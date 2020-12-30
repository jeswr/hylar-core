import type { IActorQueryOperationOutputBindings, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated } from '@comunica/bus-query-operation';
import type { ActionContext, IActorTest } from '@comunica/core';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Minus Query Operation Actor.
 */
export declare class ActorQueryOperationMinus extends ActorQueryOperationTypedMediated<Algebra.Minus> {
    constructor(args: IActorQueryOperationTypedMediatedArgs);
    testOperation(operation: Algebra.Minus, context: ActionContext): Promise<IActorTest>;
    runOperation(pattern: Algebra.Minus, context: ActionContext): Promise<IActorQueryOperationOutputBindings>;
    /**
     * This function puts all common values between 2 arrays in a map with `value` : true
     */
    private getCommonVariables;
}
