import type { IActorQueryOperationOutputStream, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated } from '@comunica/bus-query-operation';
import type { ActionContext, IActorTest } from '@comunica/core';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Slice Query Operation Actor.
 */
export declare class ActorQueryOperationSlice extends ActorQueryOperationTypedMediated<Algebra.Slice> {
    constructor(args: IActorQueryOperationTypedMediatedArgs);
    testOperation(pattern: Algebra.Slice, context: ActionContext): Promise<IActorTest>;
    runOperation(pattern: Algebra.Slice, context: ActionContext): Promise<IActorQueryOperationOutputStream>;
    private sliceStream;
    private sliceMetadata;
}
