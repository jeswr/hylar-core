import type { IActionQueryOperation, IActorQueryOperationOutput, IActorQueryOperationOutputBindings } from '@comunica/bus-query-operation';
import { ActorQueryOperationTyped } from '@comunica/bus-query-operation';
import type { ActionContext, IActorArgs, IActorTest } from '@comunica/core';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Values Query Operation Actor.
 */
export declare class ActorQueryOperationValues extends ActorQueryOperationTyped<Algebra.Values> {
    constructor(args: IActorArgs<IActionQueryOperation, IActorTest, IActorQueryOperationOutput>);
    testOperation(pattern: Algebra.Values, context: ActionContext): Promise<IActorTest>;
    runOperation(pattern: Algebra.Values, context: ActionContext): Promise<IActorQueryOperationOutputBindings>;
}
