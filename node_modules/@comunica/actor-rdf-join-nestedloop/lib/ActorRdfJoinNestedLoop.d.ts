import type { IActorQueryOperationOutput, IActorQueryOperationOutputBindings } from '@comunica/bus-query-operation';
import type { IActionRdfJoin } from '@comunica/bus-rdf-join';
import { ActorRdfJoin } from '@comunica/bus-rdf-join';
import type { IActorArgs } from '@comunica/core';
import type { IMediatorTypeIterations } from '@comunica/mediatortype-iterations';
/**
 * A comunica NestedLoop RDF Join Actor.
 */
export declare class ActorRdfJoinNestedLoop extends ActorRdfJoin {
    constructor(args: IActorArgs<IActionRdfJoin, IMediatorTypeIterations, IActorQueryOperationOutput>);
    protected getOutput(action: IActionRdfJoin): Promise<IActorQueryOperationOutputBindings>;
    protected getIterations(action: IActionRdfJoin): Promise<number>;
}
