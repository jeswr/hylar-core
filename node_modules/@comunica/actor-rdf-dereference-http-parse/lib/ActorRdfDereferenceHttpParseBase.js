"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorRdfDereferenceHttpParseBase = void 0;
const bus_http_1 = require("@comunica/bus-http");
const bus_rdf_dereference_1 = require("@comunica/bus-rdf-dereference");
const cross_fetch_1 = require("cross-fetch");
const relative_to_absolute_iri_1 = require("relative-to-absolute-iri");
/**
 * An actor that listens on the 'rdf-dereference' bus.
 *
 * It starts by grabbing all available RDF media types from the RDF parse bus.
 * After that, it resolves the URL using the HTTP bus using an accept header compiled from the available media types.
 * Finally, the response is parsed using the RDF parse bus.
 */
class ActorRdfDereferenceHttpParseBase extends bus_rdf_dereference_1.ActorRdfDereferenceMediaMappings {
    constructor(args) {
        super(args);
    }
    async test(action) {
        if (!/^https?:/u.test(action.url)) {
            throw new Error(`Cannot retrieve ${action.url} because it is not an HTTP(S) URL.`);
        }
        return true;
    }
    async run(action) {
        var _a;
        // Define accept header based on available media types.
        const { mediaTypes } = await this.mediatorRdfParseMediatypes.mediate({ context: action.context, mediaTypes: true });
        const acceptHeader = this.mediaTypesToAcceptString(mediaTypes, this.getMaxAcceptHeaderLength());
        // Resolve HTTP URL using appropriate accept header
        const headers = new cross_fetch_1.Headers({ Accept: acceptHeader });
        // Append any custom passed headers
        for (const key in action.headers) {
            headers.append(key, action.headers[key]);
        }
        const httpAction = {
            context: action.context,
            init: { headers, method: action.method },
            input: action.url,
        };
        let httpResponse;
        try {
            httpResponse = await this.mediatorHttp.mediate(httpAction);
        }
        catch (error) {
            return this.handleDereferenceError(action, error);
        }
        // The response URL can be relative to the given URL
        const url = relative_to_absolute_iri_1.resolve(httpResponse.url, action.url);
        // Convert output headers to a hash
        const outputHeaders = {};
        // eslint-disable-next-line no-return-assign
        httpResponse.headers.forEach((value, key) => outputHeaders[key] = value);
        // Only parse if retrieval was successful
        if (httpResponse.status !== 200) {
            const error = new Error(`Could not retrieve ${action.url} (${httpResponse.status}: ${httpResponse.statusText || 'unknown error'})`);
            // Close the body if we have one, to avoid process to hang
            if (httpResponse.body) {
                await httpResponse.body.cancel();
            }
            return this.handleDereferenceError(action, error);
        }
        // Wrap WhatWG readable stream into a Node.js readable stream
        // If the body already is a Node.js stream (in the case of node-fetch), don't do explicit conversion.
        const responseStream = bus_http_1.ActorHttp.toNodeReadable(httpResponse.body);
        // Parse the resulting response
        const match = ActorRdfDereferenceHttpParseBase.REGEX_MEDIATYPE
            .exec((_a = httpResponse.headers.get('content-type')) !== null && _a !== void 0 ? _a : '');
        let mediaType = match[0];
        // If no media type could be found, try to determine it via the file extension
        if (!mediaType || mediaType === 'text/plain') {
            mediaType = this.getMediaTypeFromExtension(httpResponse.url);
        }
        const parseAction = {
            baseIRI: url,
            headers: httpResponse.headers,
            input: responseStream,
        };
        let parseOutput;
        try {
            parseOutput = (await this.mediatorRdfParseHandle.mediate({ context: action.context, handle: parseAction, handleMediaType: mediaType })).handle;
        }
        catch (error) {
            return this.handleDereferenceError(action, error);
        }
        const quads = this.handleDereferenceStreamErrors(action, parseOutput.quads);
        // Return the parsed quad stream and whether or not only triples are supported
        return { url, quads, triples: parseOutput.triples, headers: outputHeaders };
    }
    mediaTypesToAcceptString(mediaTypes, maxLength) {
        const wildcard = '*/*;q=0.1';
        const parts = [];
        const sortedMediaTypes = Object.keys(mediaTypes)
            .map(mediaType => ({ mediaType, priority: mediaTypes[mediaType] }))
            .sort((left, right) => right.priority - left.priority);
        // Take into account the ',' characters joining each type
        const separatorLength = sortedMediaTypes.length - 1;
        let partsLength = separatorLength;
        for (const entry of sortedMediaTypes) {
            const part = entry.mediaType + (entry.priority !== 1 ?
                `;q=${entry.priority.toFixed(3).replace(/0*$/u, '')}` :
                '');
            if (partsLength + part.length > maxLength) {
                while (partsLength + wildcard.length > maxLength) {
                    const last = parts.pop() || '';
                    // Don't forget the ','
                    partsLength -= last.length + 1;
                }
                parts.push(wildcard);
                break;
            }
            parts.push(part);
            partsLength += part.length;
        }
        if (parts.length === 0) {
            return '*/*';
        }
        return parts.join(',');
    }
}
exports.ActorRdfDereferenceHttpParseBase = ActorRdfDereferenceHttpParseBase;
ActorRdfDereferenceHttpParseBase.REGEX_MEDIATYPE = /^[^ ;]*/u;
//# sourceMappingURL=ActorRdfDereferenceHttpParseBase.js.map