import type { IActionHttp, IActorHttpOutput } from '@comunica/bus-http';
import type { IActionRdfResolveHypermedia, IActorRdfResolveHypermediaOutput, IActorRdfResolveHypermediaTest } from '@comunica/bus-rdf-resolve-hypermedia';
import { ActorRdfResolveHypermedia } from '@comunica/bus-rdf-resolve-hypermedia';
import type { Actor, IActorArgs, IActorTest, Mediator } from '@comunica/core';
/**
 * A comunica SPARQL RDF Resolve Hypermedia Actor.
 */
export declare class ActorRdfResolveHypermediaSparql extends ActorRdfResolveHypermedia {
    readonly mediatorHttp: Mediator<Actor<IActionHttp, IActorTest, IActorHttpOutput>, IActionHttp, IActorTest, IActorHttpOutput>;
    readonly checkUrlSuffix: boolean;
    constructor(args: IActorRdfResolveHypermediaSparqlArgs);
    testMetadata(action: IActionRdfResolveHypermedia): Promise<IActorRdfResolveHypermediaTest>;
    run(action: IActionRdfResolveHypermedia): Promise<IActorRdfResolveHypermediaOutput>;
}
export interface IActorRdfResolveHypermediaSparqlArgs extends IActorArgs<IActionRdfResolveHypermedia, IActorRdfResolveHypermediaTest, IActorRdfResolveHypermediaOutput> {
    mediatorHttp: Mediator<Actor<IActionHttp, IActorTest, IActorHttpOutput>, IActionHttp, IActorTest, IActorHttpOutput>;
    checkUrlSuffix: boolean;
}
