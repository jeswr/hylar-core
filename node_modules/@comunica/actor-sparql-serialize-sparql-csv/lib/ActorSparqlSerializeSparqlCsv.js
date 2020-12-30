"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorSparqlSerializeSparqlCsv = void 0;
const stream_1 = require("stream");
const bus_sparql_serialize_1 = require("@comunica/bus-sparql-serialize");
/**
 * A comunica SPARQL CSV SPARQL Serialize Actor.
 */
class ActorSparqlSerializeSparqlCsv extends bus_sparql_serialize_1.ActorSparqlSerializeFixedMediaTypes {
    constructor(args) {
        super(args);
    }
    /**
     * Converts an RDF term to its CSV representation.
     * @param {RDF.Term} value An RDF term.
     * @return {string} A string representation of the given value.
     */
    static bindingToCsvBindings(value) {
        if (!value) {
            return '';
        }
        let stringValue = value.value;
        if (value.termType === 'Literal') {
            // This is a lossy representation, since language and datatype are not encoded in here.
            stringValue = `${stringValue}`;
        }
        else if (value.termType === 'BlankNode') {
            stringValue = `_:${stringValue}`;
        }
        else {
            stringValue = `<${stringValue}>`;
        }
        // If a value contains certain characters, put it between double quotes
        if (/[",\n\r]/u.exec(stringValue)) {
            // Within quote strings, " is written using a pair of quotation marks "".
            stringValue = `"${stringValue.replace(/"/gu, '""')}"`;
        }
        return stringValue;
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
        data.push(`${bindingsAction.variables.map((variable) => variable.slice(1)).join(',')}\r\n`);
        // Write bindings
        bindingsAction.bindingsStream.on('error', (error) => {
            data.emit('error', error);
        });
        bindingsAction.bindingsStream.on('data', (bindings) => {
            data.push(`${bindingsAction.variables
                .map((key) => ActorSparqlSerializeSparqlCsv
                .bindingToCsvBindings(bindings.get(key)))
                .join(',')}\r\n`);
        });
        bindingsAction.bindingsStream.on('end', () => {
            data.push(null);
        });
        return { data };
    }
}
exports.ActorSparqlSerializeSparqlCsv = ActorSparqlSerializeSparqlCsv;
//# sourceMappingURL=ActorSparqlSerializeSparqlCsv.js.map