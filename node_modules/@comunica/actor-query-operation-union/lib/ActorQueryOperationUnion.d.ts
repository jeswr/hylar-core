import type { IActorQueryOperationOutputBindings, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated } from '@comunica/bus-query-operation';
import type { ActionContext, IActorTest } from '@comunica/core';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Union Query Operation Actor.
 */
export declare class ActorQueryOperationUnion extends ActorQueryOperationTypedMediated<Algebra.Union> {
    constructor(args: IActorQueryOperationTypedMediatedArgs);
    /**
     * Takes the union of the given double array variables.
     * Uniqueness is guaranteed.
     * @param {string[][]} variables Double array of variables to take the union of.
     * @return {string[]} The union of the given variables.
     */
    static unionVariables(variables: string[][]): string[];
    /**
     * Takes the union of the given metadata array.
     * It will ensure that the totalItems metadata value is properly calculated.
     * @param {{[p: string]: any}[]} metadatas Array of metadata.
     * @return {{[p: string]: any}} Union of the metadata.
     */
    static unionMetadata(metadatas: Record<string, any>[]): Record<string, any>;
    testOperation(pattern: Algebra.Union, context: ActionContext): Promise<IActorTest>;
    runOperation(pattern: Algebra.Union, context: ActionContext): Promise<IActorQueryOperationOutputBindings>;
}
