import type { IActionRdfResolveQuadPattern, IActorRdfResolveQuadPatternOutput, IDataSource, IQuadSource } from '@comunica/bus-rdf-resolve-quad-pattern';
import { ActorRdfResolveQuadPatternSource } from '@comunica/bus-rdf-resolve-quad-pattern';
import type { ActionContext, Actor, IActorArgs, IActorTest, Mediator } from '@comunica/core';
import type * as RDF from 'rdf-js';
/**
 * A comunica Federated RDF Resolve Quad Pattern Actor.
 */
export declare class ActorRdfResolveQuadPatternFederated extends ActorRdfResolveQuadPatternSource implements IActorRdfResolveQuadPatternFederatedArgs {
    readonly mediatorResolveQuadPattern: Mediator<Actor<IActionRdfResolveQuadPattern, IActorTest, IActorRdfResolveQuadPatternOutput>, IActionRdfResolveQuadPattern, IActorTest, IActorRdfResolveQuadPatternOutput>;
    readonly skipEmptyPatterns: boolean;
    protected readonly emptyPatterns: Map<IDataSource, RDF.Quad[]>;
    constructor(args: IActorRdfResolveQuadPatternFederatedArgs);
    test(action: IActionRdfResolveQuadPattern): Promise<IActorTest>;
    protected getSource(context: ActionContext): Promise<IQuadSource>;
}
export interface IActorRdfResolveQuadPatternFederatedArgs extends IActorArgs<IActionRdfResolveQuadPattern, IActorTest, IActorRdfResolveQuadPatternOutput> {
    mediatorResolveQuadPattern: Mediator<Actor<IActionRdfResolveQuadPattern, IActorTest, IActorRdfResolveQuadPatternOutput>, IActionRdfResolveQuadPattern, IActorTest, IActorRdfResolveQuadPatternOutput>;
    skipEmptyPatterns?: boolean;
}
