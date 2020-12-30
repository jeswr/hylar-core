"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdfSourceQpf = void 0;
const asynciterator_1 = require("asynciterator");
const rdf_data_factory_1 = require("rdf-data-factory");
const rdf_string_1 = require("rdf-string");
const rdf_terms_1 = require("rdf-terms");
const DF = new rdf_data_factory_1.DataFactory();
/**
 * An RDF source that executes a quad pattern over a QPF interface and fetches its first page.
 */
class RdfSourceQpf {
    constructor(mediatorMetadata, mediatorMetadataExtract, mediatorRdfDereference, subjectUri, predicateUri, objectUri, graphUri, metadata, context, initialQuads) {
        this.mediatorMetadata = mediatorMetadata;
        this.mediatorMetadataExtract = mediatorMetadataExtract;
        this.mediatorRdfDereference = mediatorRdfDereference;
        this.subjectUri = subjectUri;
        this.predicateUri = predicateUri;
        this.objectUri = objectUri;
        this.graphUri = graphUri;
        this.context = context;
        this.cachedQuads = {};
        const searchForm = this.getSearchForm(metadata);
        if (!searchForm) {
            throw new Error('Illegal state: found no TPF/QPF search form anymore in metadata.');
        }
        this.searchForm = searchForm;
        this.defaultGraph = metadata.defaultGraph ? DF.namedNode(metadata.defaultGraph) : undefined;
        if (initialQuads) {
            let wrappedQuads = asynciterator_1.wrap(initialQuads);
            if (this.defaultGraph) {
                wrappedQuads = this.reverseMapQuadsToDefaultGraph(wrappedQuads);
            }
            wrappedQuads.setProperty('metadata', metadata);
            this.cacheQuads(wrappedQuads, DF.variable(''), DF.variable(''), DF.variable(''), DF.variable(''));
        }
    }
    /**
     * Get a first QPF search form.
     * @param {{[p: string]: any}} metadata A metadata object.
     * @return {ISearchForm} A search form, or null if none could be found.
     */
    getSearchForm(metadata) {
        if (!metadata.searchForms || !metadata.searchForms.values) {
            return;
        }
        // Find a quad pattern or triple pattern search form
        const { searchForms } = metadata;
        // TODO: in the future, a query-based search form getter should be used.
        for (const searchForm of searchForms.values) {
            if (this.graphUri &&
                this.subjectUri in searchForm.mappings &&
                this.predicateUri in searchForm.mappings &&
                this.objectUri in searchForm.mappings &&
                this.graphUri in searchForm.mappings &&
                Object.keys(searchForm.mappings).length === 4) {
                return searchForm;
            }
            if (this.subjectUri in searchForm.mappings &&
                this.predicateUri in searchForm.mappings &&
                this.objectUri in searchForm.mappings &&
                Object.keys(searchForm.mappings).length === 3) {
                return searchForm;
            }
        }
    }
    /**
     * Create a QPF fragment IRI for the given quad pattern.
     * @param {ISearchForm} searchForm A search form.
     * @param {Term} subject A term.
     * @param {Term} predicate A term.
     * @param {Term} object A term.
     * @param {Term} graph A term.
     * @return {string} A URI.
     */
    createFragmentUri(searchForm, subject, predicate, object, graph) {
        const entries = {};
        const input = [
            { uri: this.subjectUri, term: subject },
            { uri: this.predicateUri, term: predicate },
            { uri: this.objectUri, term: object },
            { uri: this.graphUri, term: graph },
        ];
        for (const entry of input) {
            if (entry.uri && entry.term.termType !== 'Variable') {
                entries[entry.uri] = rdf_string_1.termToString(entry.term);
            }
        }
        return searchForm.getUri(entries);
    }
    match(subject, predicate, object, graph) {
        // If we are querying the default graph,
        // and the source has an overridden value for the default graph (such as QPF can provide),
        // we override the graph parameter with that value.
        let modifiedGraph = false;
        if (this.defaultGraph && graph.termType === 'DefaultGraph') {
            modifiedGraph = true;
            graph = this.defaultGraph;
        }
        // Try to emit from cache
        const cached = this.getCachedQuads(subject, predicate, object, graph);
        if (cached) {
            return cached;
        }
        const quads = new asynciterator_1.TransformIterator(async () => {
            let url = this.createFragmentUri(this.searchForm, subject, predicate, object, graph);
            const rdfDereferenceOutput = await this.mediatorRdfDereference.mediate({ context: this.context, url });
            url = rdfDereferenceOutput.url;
            // Determine the metadata and emit it
            const rdfMetadataOuput = await this.mediatorMetadata.mediate({ context: this.context, url, quads: rdfDereferenceOutput.quads, triples: rdfDereferenceOutput.triples });
            const metadataExtractPromise = this.mediatorMetadataExtract
                .mediate({ context: this.context, url, metadata: rdfMetadataOuput.metadata })
                .then(({ metadata }) => quads.setProperty('metadata', metadata));
            // The server is free to send any data in its response (such as metadata),
            // including quads that do not match the given matter.
            // Therefore, we have to filter away all non-matching quads here.
            const actualDefaultGraph = DF.defaultGraph();
            let filteredOutput = asynciterator_1.wrap(rdfMetadataOuput.data)
                .transform({
                filter(quad) {
                    if (rdf_terms_1.matchPattern(quad, subject, predicate, object, graph)) {
                        return true;
                    }
                    // Special case: if we are querying in the default graph, and we had an overridden default graph,
                    // also accept that incoming triples may be defined in the actual default graph
                    return modifiedGraph && rdf_terms_1.matchPattern(quad, subject, predicate, object, actualDefaultGraph);
                },
            });
            if (modifiedGraph || graph.termType === 'Variable') {
                // Reverse-map the overridden default graph back to the actual default graph
                filteredOutput = this.reverseMapQuadsToDefaultGraph(filteredOutput);
            }
            // Swallow error events, as they will be emitted in the metadata stream as well,
            // and therefore thrown async next.
            filteredOutput.on('error', () => {
                // Do nothing
            });
            // Ensures metadata event is emitted before end-event
            await metadataExtractPromise;
            return filteredOutput;
        }, { autoStart: false });
        this.cacheQuads(quads, subject, predicate, object, graph);
        return this.getCachedQuads(subject, predicate, object, graph);
    }
    reverseMapQuadsToDefaultGraph(quads) {
        const actualDefaultGraph = DF.defaultGraph();
        return quads.map(quad => rdf_terms_1.mapTerms(quad, (term, key) => key === 'graph' && term.equals(this.defaultGraph) ? actualDefaultGraph : term));
    }
    getPatternId(subject, predicate, object, graph) {
        return JSON.stringify({
            s: subject.termType === 'Variable' ? '' : rdf_string_1.termToString(subject),
            p: predicate.termType === 'Variable' ? '' : rdf_string_1.termToString(predicate),
            o: object.termType === 'Variable' ? '' : rdf_string_1.termToString(object),
            g: graph.termType === 'Variable' ? '' : rdf_string_1.termToString(graph),
        });
    }
    cacheQuads(quads, subject, predicate, object, graph) {
        const patternId = this.getPatternId(subject, predicate, object, graph);
        this.cachedQuads[patternId] = quads.clone();
    }
    getCachedQuads(subject, predicate, object, graph) {
        const patternId = this.getPatternId(subject, predicate, object, graph);
        const quads = this.cachedQuads[patternId];
        if (quads) {
            return quads.clone();
        }
    }
}
exports.RdfSourceQpf = RdfSourceQpf;
//# sourceMappingURL=RdfSourceQpf.js.map