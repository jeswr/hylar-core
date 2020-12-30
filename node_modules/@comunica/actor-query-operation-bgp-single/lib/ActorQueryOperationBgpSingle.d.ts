import type { IActorQueryOperationOutput, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated } from '@comunica/bus-query-operation';
import type { ActionContext, IActorTest } from '@comunica/core';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Query Operation Actor for BGPs with a single pattern.
 */
export declare class ActorQueryOperationBgpSingle extends ActorQueryOperationTypedMediated<Algebra.Bgp> {
    constructor(args: IActorQueryOperationTypedMediatedArgs);
    testOperation(pattern: Algebra.Bgp, context: ActionContext): Promise<IActorTest>;
    runOperation(pattern: Algebra.Bgp, context: ActionContext): Promise<IActorQueryOperationOutput>;
}
