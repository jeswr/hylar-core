import type { IActionRdfResolveHypermediaLinks, IActorRdfResolveHypermediaLinksOutput } from '@comunica/bus-rdf-resolve-hypermedia-links';
import { ActorRdfResolveHypermediaLinks } from '@comunica/bus-rdf-resolve-hypermedia-links';
import type { IActorArgs, IActorTest } from '@comunica/core';
/**
 * A comunica Next RDF Resolve Hypermedia Links Actor.
 */
export declare class ActorRdfResolveHypermediaLinksNext extends ActorRdfResolveHypermediaLinks {
    constructor(args: IActorArgs<IActionRdfResolveHypermediaLinks, IActorTest, IActorRdfResolveHypermediaLinksOutput>);
    test(action: IActionRdfResolveHypermediaLinks): Promise<IActorTest>;
    run(action: IActionRdfResolveHypermediaLinks): Promise<IActorRdfResolveHypermediaLinksOutput>;
}
