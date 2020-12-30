"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorRdfDereferenceHttpParse = void 0;
const ActorRdfDereferenceHttpParseBase_1 = require("./ActorRdfDereferenceHttpParseBase");
/**
 * The non-browser variant of {@link ActorRdfDereferenceHttpParse}.
 */
class ActorRdfDereferenceHttpParse extends ActorRdfDereferenceHttpParseBase_1.ActorRdfDereferenceHttpParseBase {
    getMaxAcceptHeaderLength() {
        return this.maxAcceptHeaderLength;
    }
}
exports.ActorRdfDereferenceHttpParse = ActorRdfDereferenceHttpParse;
//# sourceMappingURL=ActorRdfDereferenceHttpParse.js.map