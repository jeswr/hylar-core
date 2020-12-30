import type { IActorContextPreprocessOutput } from '@comunica/bus-context-preprocess';
import type { IActionHttpInvalidate, IActorHttpInvalidateOutput } from '@comunica/bus-http-invalidate';
import type { IActionInit, IActorOutputInit } from '@comunica/bus-init';
import { ActorInit } from '@comunica/bus-init';
import type { IActionOptimizeQueryOperation, IActorOptimizeQueryOperationOutput } from '@comunica/bus-optimize-query-operation';
import type { IActionQueryOperation, IActorQueryOperationOutput, IActorQueryOperationOutputBindings, IActorQueryOperationOutputQuads, IActorQueryOperationOutputBoolean, Bindings } from '@comunica/bus-query-operation';
import type { IActionSparqlParse, IActorSparqlParseOutput } from '@comunica/bus-sparql-parse';
import type { IActionSparqlSerializeHandle, IActionSparqlSerializeMediaTypeFormats, IActionSparqlSerializeMediaTypes, IActorOutputSparqlSerializeHandle, IActorOutputSparqlSerializeMediaTypeFormats, IActorOutputSparqlSerializeMediaTypes, IActorSparqlSerializeOutput, IActorTestSparqlSerializeHandle, IActorTestSparqlSerializeMediaTypeFormats, IActorTestSparqlSerializeMediaTypes } from '@comunica/bus-sparql-serialize';
import type { Actor, IAction, IActorArgs, IActorTest, Logger, Mediator } from '@comunica/core';
import { ActionContext } from '@comunica/core';
import type * as RDF from 'rdf-js';
import { Algebra } from 'sparqlalgebrajs';
/**
 * A browser-safe comunica SPARQL Init Actor.
 */
export declare class ActorInitSparql extends ActorInit implements IActorInitSparqlArgs {
    private static readonly ALGEBRA_TYPES;
    readonly mediatorOptimizeQueryOperation: Mediator<Actor<IActionOptimizeQueryOperation, IActorTest, IActorOptimizeQueryOperationOutput>, IActionOptimizeQueryOperation, IActorTest, IActorOptimizeQueryOperationOutput>;
    readonly mediatorQueryOperation: Mediator<Actor<IActionQueryOperation, IActorTest, IActorQueryOperationOutput>, IActionQueryOperation, IActorTest, IActorQueryOperationOutput>;
    readonly mediatorSparqlParse: Mediator<Actor<IActionSparqlParse, IActorTest, IActorSparqlParseOutput>, IActionSparqlParse, IActorTest, IActorSparqlParseOutput>;
    readonly mediatorSparqlSerialize: Mediator<Actor<IActionSparqlSerializeHandle, IActorTestSparqlSerializeHandle, IActorOutputSparqlSerializeHandle>, IActionSparqlSerializeHandle, IActorTestSparqlSerializeHandle, IActorOutputSparqlSerializeHandle>;
    readonly mediatorSparqlSerializeMediaTypeCombiner: Mediator<Actor<IActionSparqlSerializeMediaTypes, IActorTestSparqlSerializeMediaTypes, IActorOutputSparqlSerializeMediaTypes>, IActionSparqlSerializeMediaTypes, IActorTestSparqlSerializeMediaTypes, IActorOutputSparqlSerializeMediaTypes>;
    readonly mediatorSparqlSerializeMediaTypeFormatCombiner: Mediator<Actor<IActionSparqlSerializeMediaTypeFormats, IActorTestSparqlSerializeMediaTypeFormats, IActorOutputSparqlSerializeMediaTypeFormats>, IActionSparqlSerializeMediaTypeFormats, IActorTestSparqlSerializeMediaTypeFormats, IActorOutputSparqlSerializeMediaTypeFormats>;
    readonly mediatorContextPreprocess: Mediator<Actor<IAction, IActorTest, IActorContextPreprocessOutput>, IAction, IActorTest, IActorContextPreprocessOutput>;
    readonly mediatorHttpInvalidate: Mediator<Actor<IActionHttpInvalidate, IActorTest, IActorHttpInvalidateOutput>, IActionHttpInvalidate, IActorTest, IActorHttpInvalidateOutput>;
    readonly logger: Logger;
    readonly queryString?: string;
    readonly defaultQueryInputFormat?: string;
    readonly context?: string;
    readonly contextKeyShortcuts: Record<string, string>;
    constructor(args: IActorInitSparqlArgs);
    /**
     * Add convenience methods to query results
     * @param {IActorQueryOperationOutput} results Basic query results.
     * @return {IQueryResult} Same query results with added fields.
     */
    static enhanceQueryResults(results: IActorQueryOperationOutput): IQueryResult;
    test(action: IActionInit): Promise<IActorTest>;
    /**
     * Evaluate the given query
     * @param {string | Algebra.Operation} query A query string or algebra.
     * @param context An optional query context.
     * @return {Promise<IActorQueryOperationOutput>} A promise that resolves to the query output.
     */
    query(query: string | Algebra.Operation, context?: any): Promise<IQueryResult>;
    /**
     * @param context An optional context.
     * @return {Promise<{[p: string]: number}>} All available SPARQL (weighted) result media types.
     */
    getResultMediaTypes(context?: ActionContext): Promise<Record<string, number>>;
    /**
     * @param context An optional context.
     * @return {Promise<{[p: string]: number}>} All available SPARQL result media type formats.
     */
    getResultMediaTypeFormats(context?: ActionContext): Promise<Record<string, string>>;
    /**
     * Convert a query result to a string stream based on a certain media type.
     * @param {IActorQueryOperationOutput} queryResult A query result.
     * @param {string} mediaType A media type.
     * @param {ActionContext} context An optional context.
     * @return {Promise<IActorSparqlSerializeOutput>} A text stream.
     */
    resultToString(queryResult: IActorQueryOperationOutput, mediaType?: string, context?: any): Promise<IActorSparqlSerializeOutput>;
    /**
     * Invalidate all internal caches related to the given page URL.
     * If no page URL is given, then all pages will be invalidated.
     * @param {string} url The page URL to invalidate.
     * @return {Promise<any>} A promise resolving when the caches have been invalidated.
     */
    invalidateHttpCache(url?: string): Promise<any>;
    run(action: IActionInit): Promise<IActorOutputInit>;
}
export interface IActorInitSparqlArgs extends IActorArgs<IActionInit, IActorTest, IActorOutputInit> {
    mediatorOptimizeQueryOperation: Mediator<Actor<IActionOptimizeQueryOperation, IActorTest, IActorOptimizeQueryOperationOutput>, IActionOptimizeQueryOperation, IActorTest, IActorOptimizeQueryOperationOutput>;
    mediatorQueryOperation: Mediator<Actor<IActionQueryOperation, IActorTest, IActorQueryOperationOutput>, IActionQueryOperation, IActorTest, IActorQueryOperationOutput>;
    mediatorSparqlParse: Mediator<Actor<IActionSparqlParse, IActorTest, IActorSparqlParseOutput>, IActionSparqlParse, IActorTest, IActorSparqlParseOutput>;
    mediatorSparqlSerialize: Mediator<Actor<IActionSparqlSerializeHandle, IActorTestSparqlSerializeHandle, IActorOutputSparqlSerializeHandle>, IActionSparqlSerializeHandle, IActorTestSparqlSerializeHandle, IActorOutputSparqlSerializeHandle>;
    mediatorSparqlSerializeMediaTypeCombiner: Mediator<Actor<IActionSparqlSerializeMediaTypes, IActorTestSparqlSerializeMediaTypes, IActorOutputSparqlSerializeMediaTypes>, IActionSparqlSerializeMediaTypes, IActorTestSparqlSerializeMediaTypes, IActorOutputSparqlSerializeMediaTypes>;
    mediatorSparqlSerializeMediaTypeFormatCombiner: Mediator<Actor<IActionSparqlSerializeMediaTypeFormats, IActorTestSparqlSerializeMediaTypeFormats, IActorOutputSparqlSerializeMediaTypeFormats>, IActionSparqlSerializeMediaTypeFormats, IActorTestSparqlSerializeMediaTypeFormats, IActorOutputSparqlSerializeMediaTypeFormats>;
    mediatorContextPreprocess: Mediator<Actor<IAction, IActorTest, IActorContextPreprocessOutput>, IAction, IActorTest, IActorContextPreprocessOutput>;
    mediatorHttpInvalidate: Mediator<Actor<IActionHttpInvalidate, IActorTest, IActorHttpInvalidateOutput>, IActionHttpInvalidate, IActorTest, IActorHttpInvalidateOutput>;
    logger: Logger;
    queryString?: string;
    defaultQueryInputFormat?: string;
    context?: string;
    contextKeyShortcuts: Record<string, string>;
}
/**
 * Query operation output for a bindings stream.
 * For example: SPARQL SELECT results
 */
export interface IQueryResultBindings extends IActorQueryOperationOutputBindings {
    /**
     * The collection of bindings after an 'end' event occured.
     */
    bindings: () => Promise<Bindings[]>;
}
/**
 * Query operation output for quads.
 * For example: SPARQL CONSTRUCT results
 */
export interface IQueryResultQuads extends IActorQueryOperationOutputQuads {
    /**
     * The collection of bindings after an 'end' event occured.
     */
    quads: () => Promise<RDF.Quad[]>;
}
/**
 * Query operation output for quads.
 * For example: SPARQL ASK results
 */
export interface IQueryResultBoolean extends IActorQueryOperationOutputBoolean {
}
export declare type IQueryResult = IQueryResultBindings | IQueryResultQuads | IQueryResultBoolean;
export declare const KEY_CONTEXT_INITIALBINDINGS = "@comunica/actor-init-sparql:initialBindings";
export declare const KEY_CONTEXT_QUERYFORMAT = "@comunica/actor-init-sparql:queryFormat";
export declare const KEY_CONTEXT_GRAPHQL_SINGULARIZEVARIABLES = "@comunica/actor-init-sparql:singularizeVariables";
export declare const KEY_CONTEXT_LENIENT = "@comunica/actor-init-sparql:lenient";
