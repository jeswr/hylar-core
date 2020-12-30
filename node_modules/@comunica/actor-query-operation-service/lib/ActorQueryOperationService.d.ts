import type { IActorQueryOperationOutputBindings, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated } from '@comunica/bus-query-operation';
import type { IActorTest } from '@comunica/core';
import { ActionContext } from '@comunica/core';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Service Query Operation Actor.
 * It unwraps the SERVICE operation and executes it on the given source.
 */
export declare class ActorQueryOperationService extends ActorQueryOperationTypedMediated<Algebra.Service> {
    readonly forceSparqlEndpoint: boolean;
    constructor(args: IActorQueryOperationServiceArgs);
    testOperation(pattern: Algebra.Service, context: ActionContext): Promise<IActorTest>;
    runOperation(pattern: Algebra.Service, context: ActionContext): Promise<IActorQueryOperationOutputBindings>;
}
export interface IActorQueryOperationServiceArgs extends IActorQueryOperationTypedMediatedArgs {
    forceSparqlEndpoint: boolean;
}
