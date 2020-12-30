"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEY_CONTEXT_STRICTVALUES = exports.KEY_CONTEXT_DOCUMENTLOADER = exports.ActorRdfParseJsonLd = void 0;
const bus_rdf_parse_1 = require("@comunica/bus-rdf-parse");
const jsonld_streaming_parser_1 = require("jsonld-streaming-parser");
const DocumentLoaderMediated_1 = require("./DocumentLoaderMediated");
/**
 * A JSON-LD RDF Parse actor that listens on the 'rdf-parse' bus.
 *
 * It is able to parse JSON-LD-based RDF serializations and announce the presence of them by media type.
 */
class ActorRdfParseJsonLd extends bus_rdf_parse_1.ActorRdfParseFixedMediaTypes {
    constructor(args) {
        super(args);
    }
    async testHandle(action, mediaType, context) {
        if (context &&
            context.has('@comunica/actor-rdf-parse-html-script:processing-html-script') &&
            mediaType !== 'application/ld+json') {
            throw new Error(`JSON-LD in script tags can only have media type 'application/ld+json'`);
        }
        if (!(mediaType in this.mediaTypes) && !mediaType.endsWith('+json')) {
            throw new Error(`Unrecognized media type: ${mediaType}`);
        }
        return await this.testHandleChecked(action);
    }
    async runHandle(action, mediaType, actionContext) {
        const parser = jsonld_streaming_parser_1.JsonLdParser.fromHttpResponse(action.baseIRI, mediaType, action.headers, {
            documentLoader: actionContext && actionContext.get(exports.KEY_CONTEXT_DOCUMENTLOADER) ||
                new DocumentLoaderMediated_1.DocumentLoaderMediated(this.mediatorHttp, actionContext),
            strictValues: actionContext && actionContext.get(exports.KEY_CONTEXT_STRICTVALUES),
        });
        const quads = parser.import(action.input);
        return { quads };
    }
}
exports.ActorRdfParseJsonLd = ActorRdfParseJsonLd;
exports.KEY_CONTEXT_DOCUMENTLOADER = '@comunica/actor-rdf-parse-jsonld:documentLoader';
exports.KEY_CONTEXT_STRICTVALUES = '@comunica/actor-rdf-parse-jsonld:strictValues';
//# sourceMappingURL=ActorRdfParseJsonLd.js.map