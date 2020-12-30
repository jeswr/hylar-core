"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorRdfResolveQuadPattern = exports.getDataSourceContext = exports.getDataSourceValue = exports.getDataSourceType = exports.isDataSourceRawType = exports.KEY_CONTEXT_SOURCE = exports.KEY_CONTEXT_SOURCES = void 0;
const core_1 = require("@comunica/core");
/**
 * @type {string} Context entry for data sources.
 * @value {DataSources} An array of sources.
 */
exports.KEY_CONTEXT_SOURCES = '@comunica/bus-rdf-resolve-quad-pattern:sources';
/**
 * @type {string} Context entry for a data source.
 * @value {IDataSource} A source.
 */
exports.KEY_CONTEXT_SOURCE = '@comunica/bus-rdf-resolve-quad-pattern:source';
function isDataSourceRawType(dataSource) {
    return typeof dataSource === 'string' || 'match' in dataSource;
}
exports.isDataSourceRawType = isDataSourceRawType;
function getDataSourceType(dataSource) {
    if (typeof dataSource === 'string') {
        return '';
    }
    return 'match' in dataSource ? 'rdfjsSource' : dataSource.type;
}
exports.getDataSourceType = getDataSourceType;
function getDataSourceValue(dataSource) {
    return isDataSourceRawType(dataSource) ? dataSource : dataSource.value;
}
exports.getDataSourceValue = getDataSourceValue;
function getDataSourceContext(dataSource, context) {
    if (typeof dataSource === 'string' || 'match' in dataSource || !dataSource.context) {
        return context;
    }
    return context.merge(dataSource.context);
}
exports.getDataSourceContext = getDataSourceContext;
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
class ActorRdfResolveQuadPattern extends core_1.Actor {
    constructor(args) {
        super(args);
    }
    /**
     * Get the sources from the given context.
     * @param {ActionContext} context An optional context.
     * @return {IDataSource[]} The array of sources or undefined.
     */
    getContextSources(context) {
        return context ? context.get(exports.KEY_CONTEXT_SOURCES) : undefined;
    }
    /**
     * Get the source from the given context.
     * @param {ActionContext} context An optional context.
     * @return {IDataSource} The source or undefined.
     */
    getContextSource(context) {
        return context ? context.get(exports.KEY_CONTEXT_SOURCE) : undefined;
    }
    /**
     * Get the source's raw URL value from the given context.
     * @param {IDataSource} source A source.
     * @return {string} The URL or null.
     */
    getContextSourceUrl(source) {
        if (source) {
            let fileUrl = getDataSourceValue(source);
            if (typeof fileUrl === 'string') {
                // Remove hashes from source
                const hashPosition = fileUrl.indexOf('#');
                if (hashPosition >= 0) {
                    fileUrl = fileUrl.slice(0, hashPosition);
                }
                return fileUrl;
            }
        }
    }
    /**
     * Check if the given context has a single source.
     * @param {ActionContext} context An optional context.
     * @return {boolean} If the given context has a single source of the given type.
     */
    hasContextSingleSource(context) {
        const source = this.getContextSource(context);
        return Boolean(source && (isDataSourceRawType(source) || source.value));
    }
    /**
     * Check if the given context has a single source of the given type.
     * @param {string} requiredType The required source type name.
     * @param {ActionContext} context An optional context.
     * @return {boolean} If the given context has a single source of the given type.
     */
    hasContextSingleSourceOfType(requiredType, context) {
        const source = this.getContextSource(context);
        return Boolean(source && getDataSourceType(source) === requiredType && getDataSourceValue(source));
    }
}
exports.ActorRdfResolveQuadPattern = ActorRdfResolveQuadPattern;
//# sourceMappingURL=ActorRdfResolveQuadPattern.js.map