import type { IDataSource } from '@comunica/bus-rdf-resolve-quad-pattern';
import type { ActionContext } from '@comunica/core';
/**
 * Comunica datasource utilities
 */
export declare const DataSourceUtils: {
    /**
     * Get the single source if the context contains just a single source.
     * @param {ActionContext} context A context, can be null.
     * @return {Promise<IDataSource>} A promise resolving to the single datasource or undefined.
     */
    getSingleSource(context?: ActionContext | undefined): Promise<IDataSource | undefined>;
    /**
     * Get the type of a single source
     * @param {ActionContext} context A context, can be undefined.
     * @return {Promise<string>} A promise resolving to the type of the source, can be undefined if source is undefined.
     */
    getSingleSourceType(context?: ActionContext | undefined): Promise<string | undefined>;
    /**
     * Check if the given context has a single source of the given type.
     * @param {ActionContext} context An optional context.
     * @param {string} requiredType The required source type name.
     * @return {boolean} If the given context has a single source of the given type.
     */
    singleSourceHasType(context: ActionContext | undefined, requiredType: string): Promise<boolean>;
};
