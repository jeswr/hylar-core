"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorQueryOperationPathOneOrMore = void 0;
const actor_abstract_path_1 = require("@comunica/actor-abstract-path");
const bus_query_operation_1 = require("@comunica/bus-query-operation");
const asynciterator_1 = require("asynciterator");
const rdf_string_1 = require("rdf-string");
const sparqlalgebrajs_1 = require("sparqlalgebrajs");
/**
 * A comunica Path OneOrMore Query Operation Actor.
 */
class ActorQueryOperationPathOneOrMore extends actor_abstract_path_1.ActorAbstractPath {
    constructor(args) {
        super(args, sparqlalgebrajs_1.Algebra.types.ONE_OR_MORE_PATH);
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
        if (!sVar && oVar) {
            // Get all the results of applying this once, then do zeroOrMore for those
            const single = actor_abstract_path_1.ActorAbstractPath.FACTORY.createDistinct(actor_abstract_path_1.ActorAbstractPath.FACTORY.createPath(path.subject, predicate.path, path.object, path.graph));
            const results = bus_query_operation_1.ActorQueryOperation.getSafeBindings(await this.mediatorQueryOperation.mediate({ context, operation: single }));
            const objectString = rdf_string_1.termToString(path.object);
            // All branches need to share the same termHashes to prevent duplicates
            const termHashes = {};
            const bindingsStream = new asynciterator_1.MultiTransformIterator(results.bindingsStream, {
                multiTransform: (bindings) => {
                    const val = bindings.get(objectString);
                    const graph = gVar ? bindings.get(rdf_string_1.termToString(path.graph)) : path.graph;
                    return new asynciterator_1.TransformIterator(async () => {
                        const it = new asynciterator_1.BufferedIterator();
                        await this.getObjectsPredicateStar(val, predicate.path, path.graph, context, termHashes, it, { count: 0 });
                        return it.transform({
                            transform(item, next, push) {
                                let binding = bus_query_operation_1.Bindings({ [objectString]: item });
                                if (gVar) {
                                    binding = binding.set(rdf_string_1.termToString(path.graph), graph);
                                }
                                push(binding);
                                next();
                            },
                        });
                    }, { maxBufferSize: 128 });
                },
                autoStart: false,
            });
            const variables = gVar ? [objectString, rdf_string_1.termToString(path.graph)] : [objectString];
            return { type: 'bindings', bindingsStream, variables, canContainUndefs: false };
        }
        if (sVar && oVar) {
            // Get all the results of subjects with same predicate, but once, then fill in first variable for those
            const single = actor_abstract_path_1.ActorAbstractPath.FACTORY.createDistinct(actor_abstract_path_1.ActorAbstractPath.FACTORY.createPath(path.subject, path.predicate.path, path.object, path.graph));
            const results = bus_query_operation_1.ActorQueryOperation.getSafeBindings(await this.mediatorQueryOperation.mediate({ context, operation: single }));
            const subjectString = rdf_string_1.termToString(path.subject);
            const objectString = rdf_string_1.termToString(path.object);
            const termHashes = {};
            const bindingsStream = new asynciterator_1.MultiTransformIterator(results.bindingsStream, {
                multiTransform: (bindings) => {
                    const subject = bindings.get(subjectString);
                    const object = bindings.get(objectString);
                    const graph = gVar ? bindings.get(rdf_string_1.termToString(path.graph)) : path.graph;
                    return new asynciterator_1.TransformIterator(async () => {
                        const it = new asynciterator_1.BufferedIterator();
                        await this.getSubjectAndObjectBindingsPredicateStar(subjectString, objectString, subject, object, predicate.path, graph, context, termHashes, {}, it, { count: 0 });
                        return it.transform({
                            transform(item, next, push) {
                                if (gVar) {
                                    item = item.set(rdf_string_1.termToString(path.graph), graph);
                                }
                                push(item);
                                next();
                            },
                        });
                    }, { maxBufferSize: 128 });
                },
                autoStart: false,
            });
            const variables = gVar ?
                [subjectString, objectString, rdf_string_1.termToString(path.graph)] :
                [subjectString, objectString];
            return { type: 'bindings', bindingsStream, variables, canContainUndefs: false };
        }
        if (sVar && !oVar) {
            return this.mediatorQueryOperation.mediate({
                context,
                operation: actor_abstract_path_1.ActorAbstractPath.FACTORY.createPath(path.object, actor_abstract_path_1.ActorAbstractPath.FACTORY.createOneOrMorePath(actor_abstract_path_1.ActorAbstractPath.FACTORY.createInv(predicate.path)), path.subject, path.graph),
            });
        }
        // If (!sVar && !oVar)
        const variable = this.generateVariable();
        const vString = rdf_string_1.termToString(variable);
        const results = bus_query_operation_1.ActorQueryOperation.getSafeBindings(await this.mediatorQueryOperation.mediate({
            context,
            operation: actor_abstract_path_1.ActorAbstractPath.FACTORY.createPath(path.subject, predicate, variable, path.graph),
        }));
        const bindingsStream = results.bindingsStream.transform({
            filter: item => item.get(vString).equals(path.object),
            transform(item, next, push) {
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
}
exports.ActorQueryOperationPathOneOrMore = ActorQueryOperationPathOneOrMore;
//# sourceMappingURL=ActorQueryOperationPathOneOrMore.js.map