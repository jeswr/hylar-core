import type { IActorQueryOperationOutput, IActorQueryOperationOutputBindings } from '@comunica/bus-query-operation';
import type { IActionRdfJoin } from '@comunica/bus-rdf-join';
import { ActorRdfJoin } from '@comunica/bus-rdf-join';
import type { IActorArgs, IActorTest, Mediator } from '@comunica/core';
import type { IMediatorTypeIterations } from '@comunica/mediatortype-iterations';
/**
 * A Multi Smallest RDF Join Actor.
 * It accepts 3 or more streams, joins the smallest two, and joins the result with the remaining streams.
 */
export declare class ActorRdfJoinMultiSmallest extends ActorRdfJoin {
    readonly mediatorJoin: Mediator<ActorRdfJoin, IActionRdfJoin, IMediatorTypeIterations, IActorQueryOperationOutput>;
    constructor(args: IActorRdfJoinMultiSmallestArgs);
    static getSmallestPatternId(totalItems: number[]): number;
    protected getOutput(action: IActionRdfJoin): Promise<IActorQueryOperationOutputBindings>;
    protected getIterations(action: IActionRdfJoin): Promise<number>;
}
export interface IActorRdfJoinMultiSmallestArgs extends IActorArgs<IActionRdfJoin, IActorTest, IActorQueryOperationOutput> {
    mediatorJoin: Mediator<ActorRdfJoin, IActionRdfJoin, IMediatorTypeIterations, IActorQueryOperationOutput>;
}
