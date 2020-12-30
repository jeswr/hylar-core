"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorRdfResolveQuadPatternRdfJsSource = void 0;
const bus_rdf_resolve_quad_pattern_1 = require("@comunica/bus-rdf-resolve-quad-pattern");
const RdfJsQuadSource_1 = require("./RdfJsQuadSource");
/**
 * A comunica RDFJS Source RDF Resolve Quad Pattern Actor.
 */
class ActorRdfResolveQuadPatternRdfJsSource extends bus_rdf_resolve_quad_pattern_1.ActorRdfResolveQuadPatternSource {
    constructor(args) {
        super(args);
    }
    async test(action) {
        if (!this.hasContextSingleSourceOfType('rdfjsSource', action.context)) {
            throw new Error(`${this.name} requires a single source with an rdfjsSource to be present in the context.`);
        }
        const source = this.getContextSource(action.context);
        if (!source || typeof source === 'string' || (!('match' in source) && !source.value.match)) {
            throw new Error(`${this.name} received an invalid rdfjsSource.`);
        }
        return true;
    }
    async getSource(context) {
        const source = this.getContextSource(context);
        return new RdfJsQuadSource_1.RdfJsQuadSource('match' in source ? source : source.value);
    }
}
exports.ActorRdfResolveQuadPatternRdfJsSource = ActorRdfResolveQuadPatternRdfJsSource;
//# sourceMappingURL=ActorRdfResolveQuadPatternRdfJsSource.js.map