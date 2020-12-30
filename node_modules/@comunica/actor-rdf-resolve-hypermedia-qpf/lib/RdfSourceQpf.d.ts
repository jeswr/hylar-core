import type { ISearchForm } from '@comunica/actor-rdf-metadata-extract-hydra-controls';
import type { IActionRdfDereference, IActorRdfDereferenceOutput } from '@comunica/bus-rdf-dereference';
import type { IActionRdfMetadata, IActorRdfMetadataOutput } from '@comunica/bus-rdf-metadata';
import type { IActionRdfMetadataExtract, IActorRdfMetadataExtractOutput } from '@comunica/bus-rdf-metadata-extract';
import type { IQuadSource } from '@comunica/bus-rdf-resolve-quad-pattern';
import type { ActionContext, Actor, IActorTest, Mediator } from '@comunica/core';
import type { AsyncIterator } from 'asynciterator';
import type * as RDF from 'rdf-js';
/**
 * An RDF source that executes a quad pattern over a QPF interface and fetches its first page.
 */
export declare class RdfSourceQpf implements IQuadSource {
    readonly searchForm: ISearchForm;
    private readonly mediatorMetadata;
    private readonly mediatorMetadataExtract;
    private readonly mediatorRdfDereference;
    private readonly subjectUri;
    private readonly predicateUri;
    private readonly objectUri;
    private readonly graphUri?;
    private readonly defaultGraph?;
    private readonly context?;
    private readonly cachedQuads;
    constructor(mediatorMetadata: Mediator<Actor<IActionRdfMetadata, IActorTest, IActorRdfMetadataOutput>, IActionRdfMetadata, IActorTest, IActorRdfMetadataOutput>, mediatorMetadataExtract: Mediator<Actor<IActionRdfMetadataExtract, IActorTest, IActorRdfMetadataExtractOutput>, IActionRdfMetadataExtract, IActorTest, IActorRdfMetadataExtractOutput>, mediatorRdfDereference: Mediator<Actor<IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>, IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>, subjectUri: string, predicateUri: string, objectUri: string, graphUri: string | undefined, metadata: Record<string, any>, context: ActionContext | undefined, initialQuads?: RDF.Stream);
    /**
     * Get a first QPF search form.
     * @param {{[p: string]: any}} metadata A metadata object.
     * @return {ISearchForm} A search form, or null if none could be found.
     */
    getSearchForm(metadata: Record<string, any>): ISearchForm | undefined;
    /**
     * Create a QPF fragment IRI for the given quad pattern.
     * @param {ISearchForm} searchForm A search form.
     * @param {Term} subject A term.
     * @param {Term} predicate A term.
     * @param {Term} object A term.
     * @param {Term} graph A term.
     * @return {string} A URI.
     */
    createFragmentUri(searchForm: ISearchForm, subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph: RDF.Term): string;
    match(subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph: RDF.Term): AsyncIterator<RDF.Quad>;
    protected reverseMapQuadsToDefaultGraph(quads: AsyncIterator<RDF.Quad>): AsyncIterator<RDF.Quad>;
    protected getPatternId(subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph: RDF.Term): string;
    protected cacheQuads(quads: AsyncIterator<RDF.Quad>, subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph: RDF.Term): void;
    protected getCachedQuads(subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph: RDF.Term): AsyncIterator<RDF.Quad> | undefined;
}
