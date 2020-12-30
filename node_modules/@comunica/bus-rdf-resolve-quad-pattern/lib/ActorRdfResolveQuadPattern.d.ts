import type { ActionContext, IAction, IActorArgs, IActorOutput, IActorTest } from '@comunica/core';
import { Actor } from '@comunica/core';
import type { AsyncIterator } from 'asynciterator';
import type * as RDF from 'rdf-js';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * @type {string} Context entry for data sources.
 * @value {DataSources} An array of sources.
 */
export declare const KEY_CONTEXT_SOURCES = "@comunica/bus-rdf-resolve-quad-pattern:sources";
/**
 * @type {string} Context entry for a data source.
 * @value {IDataSource} A source.
 */
export declare const KEY_CONTEXT_SOURCE = "@comunica/bus-rdf-resolve-quad-pattern:source";
export declare function isDataSourceRawType(dataSource: IDataSource): dataSource is string | RDF.Source;
export declare function getDataSourceType(dataSource: IDataSource): string | undefined;
export declare function getDataSourceValue(dataSource: IDataSource): string | RDF.Source;
export declare function getDataSourceContext(dataSource: IDataSource, context: ActionContext): ActionContext;
/**
 * A comunica actor for rdf-resolve-quad-pattern events.
 *
 * Actor types:
 * * Input:  IActionRdfResolveQuadPattern:      A quad pattern and an optional context.
 * * Test:   <none>
 * * Output: IActorRdfResolveQuadPatternOutput: The resulting quad stream and optional metadata.
 *
 * @see IActionRdfResolveQuadPattern
 * @see IActorRdfResolveQuadPatternOutput
 */
export declare abstract class ActorRdfResolveQuadPattern extends Actor<IActionRdfResolveQuadPattern, IActorTest, IActorRdfResolveQuadPatternOutput> {
    constructor(args: IActorArgs<IActionRdfResolveQuadPattern, IActorTest, IActorRdfResolveQuadPatternOutput>);
    /**
     * Get the sources from the given context.
     * @param {ActionContext} context An optional context.
     * @return {IDataSource[]} The array of sources or undefined.
     */
    protected getContextSources(context?: ActionContext): DataSources | undefined;
    /**
     * Get the source from the given context.
     * @param {ActionContext} context An optional context.
     * @return {IDataSource} The source or undefined.
     */
    protected getContextSource(context?: ActionContext): IDataSource | undefined;
    /**
     * Get the source's raw URL value from the given context.
     * @param {IDataSource} source A source.
     * @return {string} The URL or null.
     */
    protected getContextSourceUrl(source?: IDataSource): string | undefined;
    /**
     * Check if the given context has a single source.
     * @param {ActionContext} context An optional context.
     * @return {boolean} If the given context has a single source of the given type.
     */
    protected hasContextSingleSource(context?: ActionContext): boolean;
    /**
     * Check if the given context has a single source of the given type.
     * @param {string} requiredType The required source type name.
     * @param {ActionContext} context An optional context.
     * @return {boolean} If the given context has a single source of the given type.
     */
    protected hasContextSingleSourceOfType(requiredType: string, context?: ActionContext): boolean;
}
export declare type IDataSource = string | RDF.Source | {
    type?: string;
    value: string | RDF.Source;
    context?: ActionContext;
};
export declare type DataSources = IDataSource[];
export interface IActionRdfResolveQuadPattern extends IAction {
    /**
     * The quad pattern to resolve.
     */
    pattern: Algebra.Pattern;
}
export interface IActorRdfResolveQuadPatternOutput extends IActorOutput {
    /**
     * The resulting quad data stream.
     *
     * The returned stream MUST expose the property 'metadata'.
     * The implementor is reponsible for handling cases where 'metadata'
     * is being called without the stream being in flow-mode.
     * This metadata object MUST be a hash, and MAY be empty.
     * It is recommended to contain at least totalItems as an estimate of the number of quads that will be in the stream.
     */
    data: AsyncIterator<RDF.Quad>;
}
