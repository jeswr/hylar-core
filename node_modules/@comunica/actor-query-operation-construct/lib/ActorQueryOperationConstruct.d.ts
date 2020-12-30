import type { IActorQueryOperationOutputQuads, IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated } from '@comunica/bus-query-operation';
import type { ActionContext, IActorTest } from '@comunica/core';
import type * as RDF from 'rdf-js';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica Construct Query Operation Actor.
 */
export declare class ActorQueryOperationConstruct extends ActorQueryOperationTypedMediated<Algebra.Construct> {
    constructor(args: IActorQueryOperationTypedMediatedArgs);
    /**
     * Find all variables in a list of triple patterns.
     * @param {Algebra.Pattern[]} patterns An array of triple patterns.
     * @return {RDF.Variable[]} The variables in the triple patterns.
     */
    static getVariables(patterns: RDF.BaseQuad[]): RDF.Variable[];
    testOperation(pattern: Algebra.Construct, context: ActionContext): Promise<IActorTest>;
    runOperation(pattern: Algebra.Construct, context: ActionContext): Promise<IActorQueryOperationOutputQuads>;
}
