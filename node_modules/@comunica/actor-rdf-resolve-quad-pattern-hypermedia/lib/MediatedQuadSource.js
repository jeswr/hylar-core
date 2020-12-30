"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediatedQuadSource = void 0;
const MediatedLinkedRdfSourcesAsyncRdfIterator_1 = require("./MediatedLinkedRdfSourcesAsyncRdfIterator");
/**
 * A lazy quad source that creates {@link MediatedLinkedRdfSourcesAsyncRdfIterator} instances when matching quads.
 *
 * @see MediatedLinkedRdfSourcesAsyncRdfIterator
 */
class MediatedQuadSource {
    constructor(cacheSize, context, firstUrl, forceSourceType, mediators) {
        this.cacheSize = cacheSize;
        this.context = context;
        this.firstUrl = firstUrl;
        this.forceSourceType = forceSourceType;
        this.mediators = mediators;
    }
    match(subject, predicate, object, graph) {
        const it = new MediatedLinkedRdfSourcesAsyncRdfIterator_1.MediatedLinkedRdfSourcesAsyncRdfIterator(this.cacheSize, this.context, this.forceSourceType, subject, predicate, object, graph, this.firstUrl, this.mediators);
        if (!this.sourcesState) {
            it.setSourcesState();
            this.sourcesState = it.sourcesState;
        }
        else {
            it.setSourcesState(this.sourcesState);
        }
        return it;
    }
}
exports.MediatedQuadSource = MediatedQuadSource;
//# sourceMappingURL=MediatedQuadSource.js.map