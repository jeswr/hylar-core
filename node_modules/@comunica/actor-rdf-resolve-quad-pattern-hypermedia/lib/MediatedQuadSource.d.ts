import type { IQuadSource } from '@comunica/bus-rdf-resolve-quad-pattern';
import type { ActionContext } from '@comunica/core';
import type { AsyncIterator } from 'asynciterator';
import type * as RDF from 'rdf-js';
import type { ISourcesState } from './LinkedRdfSourcesAsyncRdfIterator';
import type { IMediatorArgs } from './MediatedLinkedRdfSourcesAsyncRdfIterator';
/**
 * A lazy quad source that creates {@link MediatedLinkedRdfSourcesAsyncRdfIterator} instances when matching quads.
 *
 * @see MediatedLinkedRdfSourcesAsyncRdfIterator
 */
export declare class MediatedQuadSource implements IQuadSource {
    readonly context: ActionContext;
    readonly firstUrl: string;
    readonly forceSourceType?: string;
    readonly mediators: IMediatorArgs;
    sourcesState: ISourcesState;
    private readonly cacheSize;
    constructor(cacheSize: number, context: ActionContext, firstUrl: string, forceSourceType: string | undefined, mediators: IMediatorArgs);
    match(subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph: RDF.Term): AsyncIterator<RDF.Quad>;
}
