"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorQueryOperationPathZeroOrMore = void 0;
const actor_abstract_path_1 = require("@comunica/actor-abstract-path");
const bus_query_operation_1 = require("@comunica/bus-query-operation");
const asynciterator_1 = require("asynciterator");
const rdf_string_1 = require("rdf-string");
const sparqlalgebrajs_1 = require("sparqlalgebrajs");
/**
 * A comunica Path ZeroOrMore Query Operation Actor.
 */
class ActorQueryOperationPathZeroOrMore extends actor_abstract_path_1.ActorAbstractPath {
    constructor(args) {
        super(args, sparqlalgebrajs_1.Algebra.types.ZERO_OR_MORE_PATH);
    }
    async runOperation(path, context) {
        const distinct = await this.isPathArbitraryLengthDistinct(context, path);
        if (distinct.operation) {
            return distinct.operation;
        }
        context = distinct.context;
        const predicate = path.predicate;
        const sVar = path.subject.termType === 'Variable';
        const oVar = path.object.termType === 'Variable';
        const gVar = path.graph.termType === 'Variable';
        if (sVar && oVar) {
            // Query ?s ?p ?o, to get all possible namedNodes in de the db
            const predVar = this.generateVariable(path);
            const single = actor_abstract_path_1.ActorAbstractPath.FACTORY.createPattern(path.subject, predVar, path.object, path.graph);
            const results = bus_query_operation_1.ActorQueryOperation.getSafeBindings(await this.mediatorQueryOperation.mediate({ context, operation: single }));
            const subjectString = rdf_string_1.termToString(path.subject);
            const objectString = rdf_string_1.termToString(path.object);
            // Set with all namedNodes we have already started a predicate* search from
            const entities = new Set();
            const termHashes = {};
            const bindingsStream = new asynciterator_1.MultiTransformIterator(results.bindingsStream, {
                multiTransform: (bindings) => {
                    // Get the subject and object of the triples (?s ?p ?o) and extract graph if it was a variable
                    const subject = bindings.get(subjectString);
                    const object = bindings.get(objectString);
                    const graph = gVar ? bindings.get(rdf_string_1.termToString(path.graph)) : path.graph;
                    // Make a hash of namedNode + graph to remember from where we already started a search
                    const subjectGraphHash = rdf_string_1.termToString(subject) + rdf_string_1.termToString(graph);
                    const objectGraphHash = rdf_string_1.termToString(object) + rdf_string_1.termToString(graph);
                    return new asynciterator_1.TransformIterator(async () => {
                        // If no new namedNodes in this triple, return nothing
                        if (entities.has(subjectGraphHash) && entities.has(objectGraphHash)) {
                            return new asynciterator_1.EmptyIterator();
                        }
                        // Set up an iterator to which getSubjectAndObjectBindingsPredicateStar will push solutions
                        const it = new asynciterator_1.BufferedIterator();
                        const counter = { count: 0 };
                        // If not started from this namedNode (subject in triple) in this graph, start a search
                        if (!entities.has(subjectGraphHash)) {
                            entities.add(subjectGraphHash);
                            await this.getSubjectAndObjectBindingsPredicateStar(subjectString, objectString, subject, subject, predicate.path, graph, context, termHashes, {}, it, counter);
                        }
                        // If not started from this namedNode (object in triple) in this graph, start a search
                        if (!entities.has(objectGraphHash)) {
                            entities.add(objectGraphHash);
                            await this.getSubjectAndObjectBindingsPredicateStar(subjectString, objectString, object, object, predicate.path, graph, context, termHashes, {}, it, counter);
                        }
                        return it.transform({
                            transform(item, next, push) {
                                // If the graph was a variable, fill in it's binding (we got it from the ?s ?p ?o binding)
                                if (gVar) {
                                    item = item.set(rdf_string_1.termToString(path.graph), graph);
                                }
                                push(item);
                                next();
                            },
                        });
                    });
                },
            });
            const variables = gVar ?
                [subjectString, objectString, rdf_string_1.termToString(path.graph)] :
                [subjectString, objectString];
            return { type: 'bindings', bindingsStream, variables, canContainUndefs: false };
        }
        if (!sVar && !oVar) {
            const variable = this.generateVariable();
            const bindingsStream = (await this.getObjectsPredicateStarEval(path.subject, variable, predicate.path, path.graph, context))
                .transform({
                filter: item => item.get(rdf_string_1.termToString(variable)).equals(path.object),
                transform(item, next, push) {
                    // Return graph binding if graph was a variable, otherwise empty binding
                    const binding = gVar ?
                        bus_query_operation_1.Bindings({ [rdf_string_1.termToString(path.graph)]: item.get(rdf_string_1.termToString(path.graph)) }) :
                        bus_query_operation_1.Bindings({});
                    push(binding);
                    next();
                },
            });
            return {
                type: 'bindings',
                bindingsStream,
                variables: gVar ? [rdf_string_1.termToString(path.graph)] : [],
                canContainUndefs: false,
            };
        }
        // If (sVar || oVar)
        const subject = sVar ? path.object : path.subject;
        const value = (sVar ? path.subject : path.object);
        const pred = sVar ? actor_abstract_path_1.ActorAbstractPath.FACTORY.createInv(predicate.path) : predicate.path;
        const bindingsStream = (await this.getObjectsPredicateStarEval(subject, value, pred, path.graph, context))
            .transform({
            transform(item, next, push) {
                push(item);
                next();
            },
        });
        const variables = gVar ? [rdf_string_1.termToString(value), rdf_string_1.termToString(path.graph)] : [rdf_string_1.termToString(value)];
        return { type: 'bindings', bindingsStream, variables, canContainUndefs: false };
    }
}
exports.ActorQueryOperationPathZeroOrMore = ActorQueryOperationPathZeroOrMore;
//# sourceMappingURL=ActorQueryOperationPathZeroOrMore.js.map