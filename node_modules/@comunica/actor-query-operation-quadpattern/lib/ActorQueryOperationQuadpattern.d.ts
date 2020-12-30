import type { IActionQueryOperation, IActorQueryOperationOutput, IActorQueryOperationOutputBindings } from '@comunica/bus-query-operation';
import { ActorQueryOperationTyped } from '@comunica/bus-query-operation';
import type { IActionRdfResolveQuadPattern, IActorRdfResolveQuadPatternOutput } from '@comunica/bus-rdf-resolve-quad-pattern';
import type { ActionContext, Actor, IActorArgs, IActorTest, Mediator } from '@comunica/core';
import type { AsyncIterator } from 'asynciterator';
import type * as RDF from 'rdf-js';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica actor for handling 'quadpattern' query operations.
 */
export declare class ActorQueryOperationQuadpattern extends ActorQueryOperationTyped<Algebra.Pattern> implements IActorQueryOperationQuadpatternArgs {
    readonly mediatorResolveQuadPattern: Mediator<Actor<IActionRdfResolveQuadPattern, IActorTest, IActorRdfResolveQuadPatternOutput>, IActionRdfResolveQuadPattern, IActorTest, IActorRdfResolveQuadPatternOutput>;
    constructor(args: IActorQueryOperationQuadpatternArgs);
    /**
     * Check if a term is a variable.
     * @param {RDF.Term} term An RDF term.
     * @return {any} If the term is a variable or blank node.
     */
    static isTermVariable(term: RDF.Term): any;
    /**
     * Get all variables in the given pattern.
     * No duplicates are returned.
     * @param {RDF.BaseQuad} pattern A quad pattern.
     * @return {string[]} The variables in this pattern, with '?' prefix.
     */
    static getVariables(pattern: RDF.BaseQuad): string[];
    /**
     * A helper function to find a hash with quad elements that have duplicate variables.
     *
     * @param {RDF.Quad} pattern A quad pattern.
     *
     * @return {{[p: string]: string[]}} If no equal variable names are present in the four terms, this returns undefined.
     *                                   Otherwise, this maps quad elements ('subject', 'predicate', 'object', 'graph')
     *                                   to the list of quad elements it shares a variable name with.
     *                                   If no links for a certain element exist, this element will
     *                                   not be included in the hash.
     *                                   Note 1: Quad elements will never have a link to themselves.
     *                                           So this can never occur: { subject: [ 'subject'] },
     *                                           instead 'null' would be returned.
     *                                   Note 2: Links only exist in one direction,
     *                                           this means that { subject: [ 'predicate'], predicate: [ 'subject' ] }
     *                                           will not occur, instead only { subject: [ 'predicate'] }
     *                                           will be returned.
     */
    static getDuplicateElementLinks(pattern: RDF.BaseQuad): Record<string, string[]> | undefined;
    /**
     * Get the metadata of the given action on a quad stream.
     *
     * @param {AsyncIterator<Quad>} data The data stream that is guaranteed to emit the metadata property.
     * @return {() => Promise<{[p: string]: any}>} A lazy promise behind a callback resolving to a metadata object.
     */
    protected static getMetadata(data: AsyncIterator<RDF.Quad>): () => Promise<Record<string, any>>;
    testOperation(operation: Algebra.Pattern, context?: Record<string, any>): Promise<IActorTest>;
    runOperation(pattern: Algebra.Pattern, context: ActionContext): Promise<IActorQueryOperationOutputBindings>;
}
export interface IActorQueryOperationQuadpatternArgs extends IActorArgs<IActionQueryOperation, IActorTest, IActorQueryOperationOutput> {
    mediatorResolveQuadPattern: Mediator<Actor<IActionRdfResolveQuadPattern, IActorTest, IActorRdfResolveQuadPatternOutput>, IActionRdfResolveQuadPattern, IActorTest, IActorRdfResolveQuadPatternOutput>;
}
