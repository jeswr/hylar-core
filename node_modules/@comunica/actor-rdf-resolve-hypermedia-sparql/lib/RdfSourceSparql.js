"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdfSourceSparql = void 0;
const actor_rdf_resolve_quad_pattern_sparql_json_1 = require("@comunica/actor-rdf-resolve-quad-pattern-sparql-json");
const rdf_terms_1 = require("rdf-terms");
const sparqlalgebrajs_1 = require("sparqlalgebrajs");
class RdfSourceSparql {
    constructor(url, context, mediatorHttp) {
        this.url = url;
        this.context = context;
        this.mediatorHttp = mediatorHttp;
    }
    /**
     * Send a SPARQL query to a SPARQL endpoint and retrieve its bindings as a stream.
     * @param {string} endpoint A SPARQL endpoint URL.
     * @param {string} query A SPARQL query string.
     * @param {ActionContext} context An optional context.
     * @return {BindingsStream} A stream of bindings.
     */
    queryBindings(endpoint, query, context) {
        return new actor_rdf_resolve_quad_pattern_sparql_json_1.AsyncIteratorJsonBindings(endpoint, query, context, this.mediatorHttp);
    }
    match(subject, predicate, object, graph) {
        const pattern = actor_rdf_resolve_quad_pattern_sparql_json_1.ActorRdfResolveQuadPatternSparqlJson.replaceBlankNodes(RdfSourceSparql.FACTORY.createPattern(subject, predicate, object, graph));
        const countQuery = actor_rdf_resolve_quad_pattern_sparql_json_1.ActorRdfResolveQuadPatternSparqlJson.patternToCountQuery(pattern);
        const selectQuery = actor_rdf_resolve_quad_pattern_sparql_json_1.ActorRdfResolveQuadPatternSparqlJson.patternToSelectQuery(pattern);
        // Emit metadata containing the estimated count (reject is never called)
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        new Promise(resolve => {
            const bindingsStream = this.queryBindings(this.url, countQuery, this.context);
            bindingsStream.on('data', (bindings) => {
                const count = bindings.get('?count');
                if (count) {
                    const totalItems = Number.parseInt(count.value, 10);
                    if (Number.isNaN(totalItems)) {
                        return resolve({ totalItems: Infinity });
                    }
                    return resolve({ totalItems });
                }
                return resolve({ totalItems: Infinity });
            });
            bindingsStream.on('error', () => resolve({ totalItems: Infinity }));
            bindingsStream.on('end', () => resolve({ totalItems: Infinity }));
        })
            .then(metadata => quads.setProperty('metadata', metadata));
        // Materialize the queried pattern using each found binding.
        const quads = this.queryBindings(this.url, selectQuery, this.context)
            .map((bindings) => rdf_terms_1.mapTerms(pattern, (value) => {
            if (value.termType === 'Variable') {
                const boundValue = bindings.get(`?${value.value}`);
                if (!boundValue) {
                    quads.destroy(new Error(`The endpoint ${this.url} failed to provide a binding for ${value.value}.`));
                }
                return boundValue;
            }
            return value;
        }));
        return quads;
    }
}
exports.RdfSourceSparql = RdfSourceSparql;
RdfSourceSparql.FACTORY = new sparqlalgebrajs_1.Factory();
//# sourceMappingURL=RdfSourceSparql.js.map