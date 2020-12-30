"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorAbstractPath = void 0;
const bus_query_operation_1 = require("@comunica/bus-query-operation");
const core_1 = require("@comunica/core");
const asynciterator_1 = require("asynciterator");
const rdf_data_factory_1 = require("rdf-data-factory");
const rdf_string_1 = require("rdf-string");
const sparqlalgebrajs_1 = require("sparqlalgebrajs");
const DF = new rdf_data_factory_1.DataFactory();
/**
 * An abstract actor that handles Path operations.
 *
 * Provides multiple helper functions used by the Path operation actors.
 */
class ActorAbstractPath extends bus_query_operation_1.ActorQueryOperationTypedMediated {
    constructor(args, predicateType) {
        super(args, 'path');
        this.predicateType = predicateType;
    }
    async testOperation(pattern, context) {
        if (pattern.predicate.type !== this.predicateType) {
            throw new Error(`This Actor only supports ${this.predicateType} Path operations.`);
        }
        return true;
    }
    // Generates a variable that does not yet occur in the path
    generateVariable(path, name) {
        if (!name) {
            return this.generateVariable(path, 'b');
        }
        // Path predicates can't contain variables
        if (path && (path.subject.value === name || path.object.value === name)) {
            return this.generateVariable(path, `${name}b`);
        }
        return DF.variable(name);
    }
    // Such connectivity matching does not introduce duplicates (it does not incorporate any count of the number
    // of ways the connection can be made) even if the repeated path itself would otherwise result in duplicates.
    // https://www.w3.org/TR/sparql11-query/#propertypaths
    async isPathArbitraryLengthDistinct(context, path) {
        if (!context || !context.get(ActorAbstractPath.isPathArbitraryLengthDistinctKey)) {
            context = context ?
                context.set(ActorAbstractPath.isPathArbitraryLengthDistinctKey, true) :
                core_1.ActionContext({ [ActorAbstractPath.isPathArbitraryLengthDistinctKey]: true });
            return { context,
                operation: bus_query_operation_1.ActorQueryOperation.getSafeBindings(await this.mediatorQueryOperation.mediate({
                    operation: ActorAbstractPath.FACTORY.createDistinct(path),
                    context,
                })) };
        }
        context = context.set(ActorAbstractPath.isPathArbitraryLengthDistinctKey, false);
        return { context, operation: undefined };
    }
    async predicateStarGraphVariable(subject, object, predicate, graph, context) {
        // Construct path to obtain all graphs where subject exists
        const predVar = this.generateVariable(ActorAbstractPath.FACTORY.createPath(subject, predicate, object, graph));
        const findGraphs = ActorAbstractPath.FACTORY.createUnion(ActorAbstractPath.FACTORY.createPattern(subject, predVar, object, graph), ActorAbstractPath.FACTORY.createPattern(object, predVar, subject, graph));
        const results = bus_query_operation_1.ActorQueryOperation.getSafeBindings(await this.mediatorQueryOperation.mediate({ context, operation: findGraphs }));
        const objectString = rdf_string_1.termToString(object);
        const passedGraphs = new Set();
        return new asynciterator_1.MultiTransformIterator(results.bindingsStream, {
            multiTransform: (bindings) => {
                // Extract the graph and start a predicate* search starting from subject in each graph
                const graphValue = bindings.get(rdf_string_1.termToString(graph));
                if (passedGraphs.has(rdf_string_1.termToString(graphValue))) {
                    return new asynciterator_1.EmptyIterator();
                }
                passedGraphs.add(rdf_string_1.termToString(graphValue));
                return new asynciterator_1.TransformIterator(async () => {
                    const it = new asynciterator_1.BufferedIterator();
                    await this.getObjectsPredicateStar(subject, predicate, graphValue, context, {}, it, { count: 0 });
                    return it.transform({
                        transform(item, next, push) {
                            push(bus_query_operation_1.Bindings({ [objectString]: item, [rdf_string_1.termToString(graph)]: graphValue }));
                            next();
                        },
                    });
                }, { maxBufferSize: 128 });
            },
            autoStart: false,
        });
    }
    /**
       * Returns an iterator with Bindings of the query subject predicate* ?o
       * If graph is a variable, it will also be in those bindings
       * @param {Term} subject Term of where we start the predicate* search.
       * @param {Variable} object Variable of the zeroOrMore-query.
       * @param {Term} objectVal
       * @param {Algebra.PropertyPathSymbol} predicate Predicate of the *-path.
       * @param {Term} graph The graph in which we search for the pattern. (Possibly a variable)
       * @param {ActionContext} context
       * @return {Promise<AsyncIterator<Bindings>} Iterator to where all bindings of query should have been pushed.
       */
    async getObjectsPredicateStarEval(subject, object, predicate, graph, context) {
        if (graph.termType === 'Variable') {
            return this.predicateStarGraphVariable(subject, object, predicate, graph, context);
        }
        const it = new asynciterator_1.BufferedIterator();
        await this.getObjectsPredicateStar(subject, predicate, graph, context, {}, it, { count: 0 });
        return it.transform({
            transform(item, next, push) {
                push(bus_query_operation_1.Bindings({ [rdf_string_1.termToString(object)]: item }));
                next();
            },
        });
    }
    /**
       * Pushes all terms to iterator `it` that are a solution of object predicate* ?o.
       * @param {Term} object Term of where we start the predicate* search.
       * @param {Algebra.PropertyPathSymbol} predicate Predicate of the *-path.
       * @param {Term} graph The graph in which we search for the pattern.
       * @param {ActionContext} context
       * @param {{[id: string]: Term}} termHashes Remembers the objects we've already searched for.
       * @param {BufferedIterator<Term>} it Iterator to push terms to.
       * @param {any} counter Counts how many searches are in progress to close it when needed (when counter == 0).
       * @return {Promise<void>} All solutions of query should have been pushed to it by then.
       */
    async getObjectsPredicateStar(object, predicate, graph, context, termHashes, it, counter) {
        const termString = rdf_string_1.termToString(object);
        if (termHashes[termString]) {
            return;
        }
        it._push(object);
        termHashes[termString] = object;
        counter.count++;
        const thisVariable = this.generateVariable();
        const vString = rdf_string_1.termToString(thisVariable);
        const path = ActorAbstractPath.FACTORY.createPath(object, predicate, thisVariable, graph);
        const results = bus_query_operation_1.ActorQueryOperation.getSafeBindings(await this.mediatorQueryOperation.mediate({ operation: path, context }));
        results.bindingsStream.on('data', async (bindings) => {
            const result = bindings.get(vString);
            await this.getObjectsPredicateStar(result, predicate, graph, context, termHashes, it, counter);
        });
        results.bindingsStream.on('end', () => {
            if (--counter.count === 0) {
                it.close();
            }
        });
    }
    /**
       * Pushes all terms to iterator `it` that are a solution of ?s predicate* ?o.
       * @param {string} subjectString String representation of subjectVariable
       * @param {string} objectString String representation of objectVariable
       * @param {Term} subjectVal Term of where we start the predicate* search.
       * @param {Term} objectVal Found solution for an object, start for the new step.
       * @param {Algebra.PropertyPathSymbol} predicate Predicate of the *-path.
       * @param {Term} graph The graph in which we search for the pattern.
       * @param {ActionContext} context
       * @param {{[id: string]: Promise<Term[]>}} termHashesGlobal
       * Remembers solutions for when objectVal is already been calculated, can be reused when same objectVal occurs
       * @param {{[id: string]: Term}} termHashesCurrentSubject
       * Remembers the pairs we've already searched for, can stop searching if so.
       * @param {BufferedIterator<Bindings>} it Iterator to push terms to.
       * @param {any} counter Counts how many searches are in progress to close it when needed (when counter == 0).
       * @return {Promise<void>} All solutions of query should have been pushed to it by then.
       */
    // Let the iterator `it` emit all bindings of size 2, with subjectStringVariable as value subjectVal
    // and objectStringVariable as value all nodes reachable through predicate* beginning at objectVal
    async getSubjectAndObjectBindingsPredicateStar(subjectString, objectString, subjectVal, objectVal, predicate, graph, context, termHashesGlobal, termHashesCurrentSubject, it, counter) {
        const termString = rdf_string_1.termToString(objectVal) + rdf_string_1.termToString(graph);
        // If this combination of subject and object already done, return nothing
        if (termHashesCurrentSubject[termString]) {
            return;
        }
        counter.count++;
        termHashesCurrentSubject[termString] = true;
        it._push(bus_query_operation_1.Bindings({ [subjectString]: subjectVal, [objectString]: objectVal }));
        // If every reachable node from object has already been calculated, use these for current subject too
        if (termString in termHashesGlobal) {
            const objects = await termHashesGlobal[termString];
            for (const object of objects) {
                await this.getSubjectAndObjectBindingsPredicateStar(subjectString, objectString, subjectVal, object, predicate, graph, context, termHashesGlobal, termHashesCurrentSubject, it, counter);
            }
            if (--counter.count === 0) {
                it.close();
            }
            return;
        }
        // Construct promise to calculate all reachable nodes from this object
        const promise = new Promise(async (resolve, reject) => {
            const objectsArray = [];
            // Construct path that leads us one step through predicate
            const thisVariable = this.generateVariable();
            const vString = rdf_string_1.termToString(thisVariable);
            const path = ActorAbstractPath.FACTORY.createPath(objectVal, predicate, thisVariable, graph);
            const results = bus_query_operation_1.ActorQueryOperation.getSafeBindings(await this.mediatorQueryOperation.mediate({ operation: path, context }));
            // Recursive call on all neighbours
            results.bindingsStream.on('data', async (bindings) => {
                const result = bindings.get(vString);
                objectsArray.push(result);
                await this.getSubjectAndObjectBindingsPredicateStar(subjectString, objectString, subjectVal, result, predicate, graph, context, termHashesGlobal, termHashesCurrentSubject, it, counter);
            });
            results.bindingsStream.on('error', reject);
            results.bindingsStream.on('end', () => {
                if (--counter.count === 0) {
                    it.close();
                }
                resolve(objectsArray);
            });
        });
        // Set it in the termHashesGlobal when this object occurs again they can wait for this promise
        termHashesGlobal[termString] = promise;
    }
}
exports.ActorAbstractPath = ActorAbstractPath;
ActorAbstractPath.FACTORY = new sparqlalgebrajs_1.Factory();
ActorAbstractPath.isPathArbitraryLengthDistinctKey = 'isPathArbitraryLengthDistinct';
//# sourceMappingURL=ActorAbstractPath.js.map