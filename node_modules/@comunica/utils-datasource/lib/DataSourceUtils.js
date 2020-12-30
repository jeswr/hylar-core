"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSourceUtils = void 0;
const bus_rdf_resolve_quad_pattern_1 = require("@comunica/bus-rdf-resolve-quad-pattern");
/**
 * Comunica datasource utilities
 */
exports.DataSourceUtils = {
    /**
     * Get the single source if the context contains just a single source.
     * @param {ActionContext} context A context, can be null.
     * @return {Promise<IDataSource>} A promise resolving to the single datasource or undefined.
     */
    async getSingleSource(context) {
        if (context && context.has(bus_rdf_resolve_quad_pattern_1.KEY_CONTEXT_SOURCE)) {
            // If the single source is set
            return context.get(bus_rdf_resolve_quad_pattern_1.KEY_CONTEXT_SOURCE);
        }
        if (context && context.has(bus_rdf_resolve_quad_pattern_1.KEY_CONTEXT_SOURCES)) {
            // If multiple sources are set
            const datasources = context.get(bus_rdf_resolve_quad_pattern_1.KEY_CONTEXT_SOURCES);
            if (datasources.length === 1) {
                return datasources[0];
            }
        }
    },
    /**
     * Get the type of a single source
     * @param {ActionContext} context A context, can be undefined.
     * @return {Promise<string>} A promise resolving to the type of the source, can be undefined if source is undefined.
     */
    async getSingleSourceType(context) {
        const source = await this.getSingleSource(context);
        return source ? bus_rdf_resolve_quad_pattern_1.getDataSourceType(source) : undefined;
    },
    /**
     * Check if the given context has a single source of the given type.
     * @param {ActionContext} context An optional context.
     * @param {string} requiredType The required source type name.
     * @return {boolean} If the given context has a single source of the given type.
     */
    async singleSourceHasType(context, requiredType) {
        const actualType = await this.getSingleSourceType(context);
        return actualType ? actualType === requiredType : false;
    },
};
//# sourceMappingURL=DataSourceUtils.js.map