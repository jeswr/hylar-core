import type { IActorQueryOperationOutputBindings, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated } from '@comunica/bus-query-operation';
import type { ActionContext, IActorTest } from '@comunica/core';
import { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica OrderBy Sparqlee Query Operation Actor.
 */
export declare class ActorQueryOperationOrderBySparqlee extends ActorQueryOperationTypedMediated<Algebra.OrderBy> {
    private readonly window;
    constructor(args: IActorQueryOperationOrderBySparqleeArgs);
    testOperation(pattern: Algebra.OrderBy, context: ActionContext): Promise<IActorTest>;
    runOperation(pattern: Algebra.OrderBy, context: ActionContext): Promise<IActorQueryOperationOutputBindings>;
    private extractSortExpression;
    private isAscending;
}
/**
 * The window parameter determines how many of the elements to consider when sorting.
 */
export interface IActorQueryOperationOrderBySparqleeArgs extends IActorQueryOperationTypedMediatedArgs {
    window?: number;
}
