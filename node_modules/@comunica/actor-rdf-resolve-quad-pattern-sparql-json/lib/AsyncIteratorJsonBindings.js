"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncIteratorJsonBindings = void 0;
const bus_http_1 = require("@comunica/bus-http");
const bus_query_operation_1 = require("@comunica/bus-query-operation");
const asynciterator_1 = require("asynciterator");
const sparqljson_parse_1 = require("sparqljson-parse");
/**
 * An AsyncIterator that executes a SPARQL query against an endpoint, parses each binding, and emits it in this stream.
 */
class AsyncIteratorJsonBindings extends asynciterator_1.BufferedIterator {
    constructor(endpoint, query, context, mediatorHttp) {
        super({ autoStart: false, maxBufferSize: Infinity });
        this.initialized = false;
        this.endpoint = endpoint;
        this.query = query;
        this.context = context;
        this.mediatorHttp = mediatorHttp;
    }
    _read(count, done) {
        if (!this.initialized) {
            this.initialized = true;
            this.fetchBindingsStream(this.endpoint, this.query, this.context)
                .then(responseStream => {
                const rawBindingsStream = new sparqljson_parse_1.SparqlJsonParser({ prefixVariableQuestionMark: true })
                    .parseJsonResultsStream(responseStream);
                responseStream.on('error', error => rawBindingsStream.emit('error', error));
                rawBindingsStream.on('error', error => this.emit('error', error));
                rawBindingsStream.on('data', rawBindings => this._push(bus_query_operation_1.Bindings(rawBindings)));
                rawBindingsStream.on('end', () => {
                    this.close();
                });
                super._read(count, done);
            })
                .catch(error => this.emit('error', error));
        }
        else {
            super._read(count, done);
        }
    }
    async fetchBindingsStream(endpoint, query, context) {
        const url = `${endpoint}?query=${encodeURIComponent(query)}`;
        // Initiate request
        const headers = new Headers();
        headers.append('Accept', 'application/sparql-results+json');
        const httpAction = { context, input: url, init: { headers } };
        const httpResponse = await this.mediatorHttp.mediate(httpAction);
        // Wrap WhatWG readable stream into a Node.js readable stream
        // If the body already is a Node.js stream (in the case of node-fetch), don't do explicit conversion.
        const responseStream = bus_http_1.ActorHttp.toNodeReadable(httpResponse.body);
        // Emit an error if the server returned an invalid response
        if (!httpResponse.ok) {
            throw new Error(`Invalid SPARQL endpoint (${endpoint}) response: ${httpResponse.statusText} (${httpResponse.status})`);
        }
        return responseStream;
    }
}
exports.AsyncIteratorJsonBindings = AsyncIteratorJsonBindings;
//# sourceMappingURL=AsyncIteratorJsonBindings.js.map