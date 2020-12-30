"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEY_CONTEXT_AUTH = exports.KEY_CONTEXT_INCLUDE_CREDENTIALS = exports.ActorHttp = void 0;
const core_1 = require("@comunica/core");
/**
 * A base actor for listening to HTTP events.
 *
 * Actor types:
 * * Input:  IActionHttp:      The HTTP request.
 * * Test:   IActorHttpTest:   An estimate for the response time.
 * * Output: IActorHttpOutput: The HTTP response.
 *
 * @see IActionHttp
 * @see IActorHttpTest
 * @see IActorHttpOutput
 */
class ActorHttp extends core_1.Actor {
    constructor(args) {
        super(args);
    }
    /**
     * Converts a WhatWG streams to Node streams if required.
     * Returns the input in case the stream already is a Node stream.
     * @param {ReadableStream} body
     * @returns {NodeJS.ReadableStream}
     */
    static toNodeReadable(body) {
        return require('is-stream')(body) ? body : require('web-streams-node').toNodeReadable(body);
    }
    /**
     * Convert the given headers object into a raw hash.
     * @param headers A headers object.
     */
    static headersToHash(headers) {
        const hash = {};
        headers.forEach((value, key) => {
            hash[key] = value;
        });
        return hash;
    }
}
exports.ActorHttp = ActorHttp;
/**
 * @type {string} Context entry for the include credentials glags.
 */
exports.KEY_CONTEXT_INCLUDE_CREDENTIALS = '@comunica/bus-http:include-credentials';
/**
 * @type {string} Context entry for the authentication for a source.
 * @value {string} "username:password"-pair.
 */
exports.KEY_CONTEXT_AUTH = '@comunica/bus-http:auth';
//# sourceMappingURL=ActorHttp.js.map