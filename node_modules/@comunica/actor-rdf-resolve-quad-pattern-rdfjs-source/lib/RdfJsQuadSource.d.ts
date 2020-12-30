import type { IQuadSource } from '@comunica/bus-rdf-resolve-quad-pattern';
import type { AsyncIterator } from 'asynciterator';
import type * as RDF from 'rdf-js';
import type { IRdfJsSourceExtended } from './IRdfJsSourceExtended';
/**
 * A quad source that wraps over an {@link RDF.Source}.
 */
export declare class RdfJsQuadSource implements IQuadSource {
    private readonly source;
    constructor(source: IRdfJsSourceExtended);
    static nullifyVariables(term?: RDF.Term): RDF.Term | undefined;
    match(subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph: RDF.Term): AsyncIterator<RDF.Quad>;
    protected setMetadata(it: AsyncIterator<RDF.Quad>, subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph: RDF.Term): Promise<void>;
}
