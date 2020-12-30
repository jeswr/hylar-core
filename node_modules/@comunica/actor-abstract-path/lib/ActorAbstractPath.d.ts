import type { IActorQueryOperationTypedMediatedArgs, IActorQueryOperationOutputBindings } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated, Bindings } from '@comunica/bus-query-operation';
import type { IActorTest } from '@comunica/core';
import { ActionContext } from '@comunica/core';
import type { AsyncIterator } from 'asynciterator';
import { BufferedIterator } from 'asynciterator';
import type { Term, Variable } from 'rdf-js';
import type { Algebra } from 'sparqlalgebrajs';
import { Factory } from 'sparqlalgebrajs';
/**
 * An abstract actor that handles Path operations.
 *
 * Provides multiple helper functions used by the Path operation actors.
 */
export declare abstract class ActorAbstractPath extends ActorQueryOperationTypedMediated<Algebra.Path> {
    protected static readonly FACTORY: Factory;
    protected readonly predicateType: string;
    static isPathArbitraryLengthDistinctKey: string;
    protected constructor(args: IActorQueryOperationTypedMediatedArgs, predicateType: string);
    testOperation(pattern: Algebra.Path, context: ActionContext): Promise<IActorTest>;
    generateVariable(path?: Algebra.Path, name?: string): Variable;
    isPathArbitraryLengthDistinct(context: ActionContext, path: Algebra.Path): Promise<{
        context: ActionContext;
        operation: IActorQueryOperationOutputBindings | undefined;
    }>;
    private predicateStarGraphVariable;
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
    getObjectsPredicateStarEval(subject: Term, object: Variable, predicate: Algebra.PropertyPathSymbol, graph: Term, context: ActionContext): Promise<AsyncIterator<Bindings>>;
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
    getObjectsPredicateStar(object: Term, predicate: Algebra.PropertyPathSymbol, graph: Term, context: ActionContext, termHashes: Record<string, Term>, it: BufferedIterator<Term>, counter: any): Promise<void>;
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
    getSubjectAndObjectBindingsPredicateStar(subjectString: string, objectString: string, subjectVal: Term, objectVal: Term, predicate: Algebra.PropertyPathSymbol, graph: Term, context: ActionContext, termHashesGlobal: Record<string, Promise<Term[]>>, termHashesCurrentSubject: Record<string, boolean>, it: BufferedIterator<Bindings>, counter: any): Promise<void>;
}
