import type { IActionRdfResolveHypermedia, IActorRdfResolveHypermediaOutput, IActorRdfResolveHypermediaTest } from '@comunica/bus-rdf-resolve-hypermedia';
import { ActorRdfResolveHypermedia } from '@comunica/bus-rdf-resolve-hypermedia';
import type { IActorArgs } from '@comunica/core';
/**
 * A comunica None RDF Resolve Hypermedia Actor.
 */
export declare class ActorRdfResolveHypermediaNone extends ActorRdfResolveHypermedia {
    constructor(args: IActorArgs<IActionRdfResolveHypermedia, IActorRdfResolveHypermediaTest, IActorRdfResolveHypermediaOutput>);
    testMetadata(action: IActionRdfResolveHypermedia): Promise<IActorRdfResolveHypermediaTest>;
    run(action: IActionRdfResolveHypermedia): Promise<IActorRdfResolveHypermediaOutput>;
}
