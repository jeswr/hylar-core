"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorSparqlSerializeSparqlTsv = void 0;
const stream_1 = require("stream");
const bus_sparql_serialize_1 = require("@comunica/bus-sparql-serialize");
const rdf_string_ttl_1 = require("rdf-string-ttl");
/**
 * A comunica SPARQL TSV SPARQL Serialize Actor.
 */
class ActorSparqlSerializeSparqlTsv extends bus_sparql_serialize_1.ActorSparqlSerializeFixedMediaTypes {
    constructor(args) {
        super(args);
    }
    /**
     * Converts an RDF term to its TSV representation.
     * @param {RDF.Term} value An RDF term.
     * @return {string} A string representation of the given value.
     */
    static bindingToTsvBindings(value) {
        if (!value) {
            return '';
        }
        // Escape tab, newline and carriage return characters
        return rdf_string_ttl_1.termToString(value)
            .replace(/\t/gu, '\\t')
            .replace(/\n/gu, '\\n')
            .replace(/\r/gu, '\\r');
    }
    async testHandleChecked(action, context) {
        if (action.type !== 'bindings') {
            throw new Error('This actor can only handle bindings streams.');
        }
        return true;
    }
    async runHandle(action, mediaType, context) {
        const bindingsAction = action;
        const data = new stream_1.Readable();
        data._read = () => {
            // Do nothing
        };
        // Write head
        data.push(`${bindingsAction.variables.map((variable) => variable.slice(1)).join('\t')}\n`);
        // Write bindings
        bindingsAction.bindingsStream.on('error', (error) => {
            data.emit('error', error);
        });
        bindingsAction.bindingsStream.on('data', (bindings) => {
            data.push(`${bindingsAction.variables
                .map((key) => ActorSparqlSerializeSparqlTsv
                .bindingToTsvBindings(bindings.get(key)))
                .join('\t')}\n`);
        });
        bindingsAction.bindingsStream.on('end', () => {
            data.push(null);
        });
        return { data };
    }
}
exports.ActorSparqlSerializeSparqlTsv = ActorSparqlSerializeSparqlTsv;
//# sourceMappingURL=ActorSparqlSerializeSparqlTsv.js.map