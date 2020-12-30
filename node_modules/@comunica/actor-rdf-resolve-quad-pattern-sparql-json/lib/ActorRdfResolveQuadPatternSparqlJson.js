"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorRdfResolveQuadPatternSparqlJson = void 0;
const bus_rdf_resolve_quad_pattern_1 = require("@comunica/bus-rdf-resolve-quad-pattern");
const asynciterator_1 = require("asynciterator");
const rdf_data_factory_1 = require("rdf-data-factory");
const rdf_terms_1 = require("rdf-terms");
const sparqlalgebrajs_1 = require("sparqlalgebrajs");
const AsyncIteratorJsonBindings_1 = require("./AsyncIteratorJsonBindings");
const DF = new rdf_data_factory_1.DataFactory();
/**
 * A comunica SPARQL JSON RDF Resolve Quad Pattern Actor.
 */
class ActorRdfResolveQuadPatternSparqlJson extends bus_rdf_resolve_quad_pattern_1.ActorRdfResolveQuadPattern {
    constructor(args) {
        super(args);
    }
    /**
     * Replace all blank nodes in a pattern with variables.
     * If the pattern contains no blank nodes the original pattern gets returned.
     * @param {RDF.BaseQuad} pattern A quad pattern.
     * @return {RDF.BaseQuad} A quad pattern with no blank nodes.
     */
    static replaceBlankNodes(pattern) {
        const variableNames = rdf_terms_1.getVariables(rdf_terms_1.getTerms(pattern)).map(variableTerm => variableTerm.value);
        // Track the names the blank nodes get mapped to (required if the name has to change)
        const blankMap = {};
        let changed = false;
        // For every position, convert to a variable if there is a blank node
        const result = rdf_terms_1.mapTerms(pattern, term => {
            if (term.termType === 'BlankNode') {
                let name = term.value;
                if (blankMap[name]) {
                    name = blankMap[name];
                }
                else {
                    if (variableNames.includes(name)) {
                        // Increase index added to name until we find one that is available (2 loops at most)
                        let idx = 0;
                        while (variableNames.includes(`${name}${idx}`)) {
                            ++idx;
                        }
                        name += idx;
                    }
                    blankMap[term.value] = name;
                    variableNames.push(name);
                }
                changed = true;
                return DF.variable(name);
            }
            return term;
        });
        return changed ? result : pattern;
    }
    /**
     * Convert a quad pattern to a BGP with only that pattern.
     * @param {RDF.pattern} quad A quad pattern.
     * @return {Bgp} A BGP.
     */
    static patternToBgp(pattern) {
        return ActorRdfResolveQuadPatternSparqlJson.FACTORY.createBgp([ActorRdfResolveQuadPatternSparqlJson.FACTORY
                .createPattern(pattern.subject, pattern.predicate, pattern.object, pattern.graph)]);
    }
    /**
     * Convert a quad pattern to a select query for this pattern.
     * @param {RDF.Quad} pattern A quad pattern.
     * @return {string} A select query string.
     */
    static patternToSelectQuery(pattern) {
        const variables = rdf_terms_1.getVariables(rdf_terms_1.getTerms(pattern));
        return sparqlalgebrajs_1.toSparql(ActorRdfResolveQuadPatternSparqlJson.FACTORY.createProject(ActorRdfResolveQuadPatternSparqlJson.patternToBgp(pattern), variables));
    }
    /**
     * Convert a quad pattern to a count query for the number of matching triples for this pattern.
     * @param {RDF.Quad} pattern A quad pattern.
     * @return {string} A count query string.
     */
    static patternToCountQuery(pattern) {
        return sparqlalgebrajs_1.toSparql(ActorRdfResolveQuadPatternSparqlJson.FACTORY.createProject(ActorRdfResolveQuadPatternSparqlJson.FACTORY.createExtend(ActorRdfResolveQuadPatternSparqlJson.FACTORY.createGroup(ActorRdfResolveQuadPatternSparqlJson.patternToBgp(pattern), [], [ActorRdfResolveQuadPatternSparqlJson.FACTORY.createBoundAggregate(DF.variable('var0'), 'count', ActorRdfResolveQuadPatternSparqlJson.FACTORY.createWildcardExpression(), false)]), DF.variable('count'), ActorRdfResolveQuadPatternSparqlJson.FACTORY.createTermExpression(DF.variable('var0'))), [DF.variable('count')]));
    }
    async test(action) {
        if (!this.hasContextSingleSourceOfType('sparql', action.context)) {
            throw new Error(`${this.name} requires a single source with a 'sparql' endpoint to be present in the context.`);
        }
        return true;
    }
    async run(action) {
        const endpoint = this.getContextSourceUrl(this.getContextSource(action.context));
        const pattern = ActorRdfResolveQuadPatternSparqlJson.replaceBlankNodes(action.pattern);
        const selectQuery = ActorRdfResolveQuadPatternSparqlJson.patternToSelectQuery(pattern);
        const countQuery = ActorRdfResolveQuadPatternSparqlJson.patternToCountQuery(pattern);
        // Create promise for the metadata containing the estimated count
        this.queryBindings(endpoint, countQuery, action.context)
            .then((bindingsStream) => new Promise(resolve => {
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
        }))
            .then(metadata => data.setProperty('metadata', metadata))
            .catch(error => {
            data.destroy(error);
            data.setProperty('metadata', { totalItems: Infinity });
        });
        // Materialize the queried pattern using each found binding.
        const data = new asynciterator_1.TransformIterator(async () => (await this.queryBindings(endpoint, selectQuery, action.context))
            .map((bindings) => rdf_terms_1.mapTerms(pattern, (value) => {
            if (value.termType === 'Variable') {
                const boundValue = bindings.get(`?${value.value}`);
                if (!boundValue) {
                    data.emit('error', new Error(`The endpoint ${endpoint} failed to provide a binding for ${value.value}`));
                }
                return boundValue;
            }
            return value;
        })), { autoStart: false });
        return { data };
    }
    /**
     * Send a SPARQL query to a SPARQL endpoint and retrieve its bindings as a stream.
     * @param {string} endpoint A SPARQL endpoint URL.
     * @param {string} query A SPARQL query string.
     * @param {ActionContext} context An optional context.
     * @return {Promise<BindingsStream>} A promise resolving to a stream of bindings.
     */
    async queryBindings(endpoint, query, context) {
        return new AsyncIteratorJsonBindings_1.AsyncIteratorJsonBindings(endpoint, query, context, this.mediatorHttp);
    }
}
exports.ActorRdfResolveQuadPatternSparqlJson = ActorRdfResolveQuadPatternSparqlJson;
ActorRdfResolveQuadPatternSparqlJson.FACTORY = new sparqlalgebrajs_1.Factory();
//# sourceMappingURL=ActorRdfResolveQuadPatternSparqlJson.js.map