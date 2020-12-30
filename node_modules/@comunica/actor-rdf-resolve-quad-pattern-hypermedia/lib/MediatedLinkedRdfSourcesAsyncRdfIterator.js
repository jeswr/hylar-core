"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediatedLinkedRdfSourcesAsyncRdfIterator = void 0;
const LinkedRdfSourcesAsyncRdfIterator_1 = require("./LinkedRdfSourcesAsyncRdfIterator");
/**
 * An quad iterator that can iterate over consecutive RDF sources
 * that are determined using the rdf-resolve-hypermedia-links bus.
 *
 * @see LinkedRdfSourcesAsyncRdfIterator
 */
class MediatedLinkedRdfSourcesAsyncRdfIterator extends LinkedRdfSourcesAsyncRdfIterator_1.LinkedRdfSourcesAsyncRdfIterator {
    constructor(cacheSize, context, forceSourceType, subject, predicate, object, graph, firstUrl, mediators) {
        super(cacheSize, subject, predicate, object, graph, firstUrl);
        this.context = context;
        this.forceSourceType = forceSourceType;
        this.mediatorRdfDereference = mediators.mediatorRdfDereference;
        this.mediatorMetadata = mediators.mediatorMetadata;
        this.mediatorMetadataExtract = mediators.mediatorMetadataExtract;
        this.mediatorRdfResolveHypermedia = mediators.mediatorRdfResolveHypermedia;
        this.mediatorRdfResolveHypermediaLinks = mediators.mediatorRdfResolveHypermediaLinks;
        this.handledUrls = {};
    }
    async getSourceLinks(metadata) {
        try {
            const { urls } = await this.mediatorRdfResolveHypermediaLinks.mediate({ context: this.context, metadata });
            const links = urls.map(url => typeof url === 'string' ? { url } : url);
            // Filter URLs to avoid cyclic next-page loops
            return links.filter(link => {
                if (this.handledUrls[link.url]) {
                    return false;
                }
                this.handledUrls[link.url] = true;
                return true;
            });
        }
        catch (_a) {
            // No next URLs may be available, for example when we've reached the end of a Hydra next-page sequence.
            return [];
        }
    }
    async getSource(link, handledDatasets) {
        // Include context entries from link
        let context = this.context;
        if (link.context) {
            context = context.merge(link.context);
        }
        // Get the RDF representation of the given document
        let url = link.url;
        const rdfDereferenceOutput = await this.mediatorRdfDereference
            .mediate({ context, url });
        url = rdfDereferenceOutput.url;
        // Determine the metadata
        const rdfMetadataOuput = await this.mediatorMetadata.mediate({ context, url, quads: rdfDereferenceOutput.quads, triples: rdfDereferenceOutput.triples });
        const { metadata } = await this.mediatorMetadataExtract
            .mediate({ context, url, metadata: rdfMetadataOuput.metadata });
        // Optionally filter the resulting data
        if (link.transform) {
            rdfMetadataOuput.data = await link.transform(rdfMetadataOuput.data);
        }
        // Determine the source
        const { source, dataset } = await this.mediatorRdfResolveHypermedia.mediate({
            context,
            forceSourceType: this.forceSourceType,
            handledDatasets,
            metadata,
            quads: rdfMetadataOuput.data,
            url,
        });
        if (dataset) {
            // Mark the dataset as applied
            // This is needed to make sure that things like QPF search forms are only applied once,
            // and next page links are followed after that.
            handledDatasets[dataset] = true;
        }
        return { source, metadata, handledDatasets };
    }
}
exports.MediatedLinkedRdfSourcesAsyncRdfIterator = MediatedLinkedRdfSourcesAsyncRdfIterator;
//# sourceMappingURL=MediatedLinkedRdfSourcesAsyncRdfIterator.js.map