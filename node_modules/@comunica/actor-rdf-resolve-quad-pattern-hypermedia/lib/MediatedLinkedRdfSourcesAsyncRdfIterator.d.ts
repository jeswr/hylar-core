import type { IActionRdfDereference, IActorRdfDereferenceOutput } from '@comunica/bus-rdf-dereference';
import type { IActionRdfMetadata, IActorRdfMetadataOutput } from '@comunica/bus-rdf-metadata';
import type { IActionRdfMetadataExtract, IActorRdfMetadataExtractOutput } from '@comunica/bus-rdf-metadata-extract';
import type { IActionRdfResolveHypermedia, IActorRdfResolveHypermediaOutput } from '@comunica/bus-rdf-resolve-hypermedia';
import type { IActionRdfResolveHypermediaLinks, IActorRdfResolveHypermediaLinksOutput, ILink } from '@comunica/bus-rdf-resolve-hypermedia-links';
import type { ActionContext, Actor, IActorTest, Mediator } from '@comunica/core';
import type * as RDF from 'rdf-js';
import type { ISourceState } from './LinkedRdfSourcesAsyncRdfIterator';
import { LinkedRdfSourcesAsyncRdfIterator } from './LinkedRdfSourcesAsyncRdfIterator';
/**
 * An quad iterator that can iterate over consecutive RDF sources
 * that are determined using the rdf-resolve-hypermedia-links bus.
 *
 * @see LinkedRdfSourcesAsyncRdfIterator
 */
export declare class MediatedLinkedRdfSourcesAsyncRdfIterator extends LinkedRdfSourcesAsyncRdfIterator {
    private readonly mediatorRdfDereference;
    private readonly mediatorMetadata;
    private readonly mediatorMetadataExtract;
    private readonly mediatorRdfResolveHypermedia;
    private readonly mediatorRdfResolveHypermediaLinks;
    private readonly context;
    private readonly forceSourceType?;
    private readonly handledUrls;
    constructor(cacheSize: number, context: ActionContext, forceSourceType: string | undefined, subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph: RDF.Term, firstUrl: string, mediators: IMediatorArgs);
    protected getSourceLinks(metadata: Record<string, any>): Promise<ILink[]>;
    protected getSource(link: ILink, handledDatasets: Record<string, boolean>): Promise<ISourceState>;
}
export interface IMediatorArgs {
    mediatorRdfDereference: Mediator<Actor<IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>, IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>;
    mediatorMetadata: Mediator<Actor<IActionRdfMetadata, IActorTest, IActorRdfMetadataOutput>, IActionRdfMetadata, IActorTest, IActorRdfMetadataOutput>;
    mediatorMetadataExtract: Mediator<Actor<IActionRdfMetadataExtract, IActorTest, IActorRdfMetadataExtractOutput>, IActionRdfMetadataExtract, IActorTest, IActorRdfMetadataExtractOutput>;
    mediatorRdfResolveHypermedia: Mediator<Actor<IActionRdfResolveHypermedia, IActorTest, IActorRdfResolveHypermediaOutput>, IActionRdfResolveHypermedia, IActorTest, IActorRdfResolveHypermediaOutput>;
    mediatorRdfResolveHypermediaLinks: Mediator<Actor<IActionRdfResolveHypermediaLinks, IActorTest, IActorRdfResolveHypermediaLinksOutput>, IActionRdfResolveHypermediaLinks, IActorTest, IActorRdfResolveHypermediaLinksOutput>;
}
