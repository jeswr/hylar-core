"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorSparqlSerializeSparqlJson = void 0;
const stream_1 = require("stream");
const bus_sparql_serialize_1 = require("@comunica/bus-sparql-serialize");
/**
 * A comunica sparql-results+xml Serialize Actor.
 */
class ActorSparqlSerializeSparqlJson extends bus_sparql_serialize_1.ActorSparqlSerializeFixedMediaTypes {
    constructor(args) {
        super(args);
    }
    /**
     * Converts an RDF term to its JSON representation.
     * @param {RDF.Term} value An RDF term.
     * @return {any} A JSON object.
     */
    static bindingToJsonBindings(value) {
        if (value.termType === 'Literal') {
            const literal = value;
            const jsonValue = { value: literal.value, type: 'literal' };
            const { language } = literal;
            const { datatype } = literal;
            if (language) {
                jsonValue['xml:lang'] = language;
            }
            else if (datatype && datatype.value !== 'http://www.w3.org/2001/XMLSchema#string') {
                jsonValue.datatype = datatype.value;
            }
            return jsonValue;
        }
        if (value.termType === 'BlankNode') {
            return { value: value.value, type: 'bnode' };
        }
        return { value: value.value, type: 'uri' };
    }
    async testHandleChecked(action, context) {
        if (!['bindings', 'boolean'].includes(action.type)) {
            throw new Error('This actor can only handle bindings streams or booleans.');
        }
        return true;
    }
    async runHandle(action, mediaType, context) {
        const data = new stream_1.Readable();
        data._read = () => {
            // Do nothing
        };
        // Write head
        const head = {};
        if (action.type === 'bindings' && action.variables.length > 0) {
            head.vars = action.variables.map((variable) => variable.slice(1));
        }
        data.push(`{"head": ${JSON.stringify(head)},\n`);
        let empty = true;
        if (action.type === 'bindings') {
            const resultStream = action.bindingsStream;
            // Write bindings
            resultStream.on('error', (error) => {
                data.emit('error', error);
            });
            resultStream.on('data', (bindings) => {
                if (empty) {
                    data.push('"results": { "bindings": [\n');
                }
                else {
                    data.push(',\n');
                }
                // JSON SPARQL results spec does not allow unbound variables and blank node bindings
                const realBindings = bindings
                    .filter((value, key) => Boolean(value) && key.startsWith('?'));
                data.push(JSON.stringify(realBindings.mapEntries(([key, value]) => [key.slice(1), ActorSparqlSerializeSparqlJson.bindingToJsonBindings(value)])
                    .toJSON()));
                empty = false;
            });
            // Close streams
            resultStream.on('end', () => {
                if (empty) {
                    data.push('"results": { "bindings": [] }}\n');
                }
                else {
                    data.push('\n]}}\n');
                }
                data.push(null);
            });
        }
        else {
            try {
                data.push(`"boolean":${await action.booleanResult}\n}\n`);
                data.push(null);
            }
            catch (error) {
                data.once('newListener', () => data.emit('error', error));
            }
        }
        return { data };
    }
}
exports.ActorSparqlSerializeSparqlJson = ActorSparqlSerializeSparqlJson;
//# sourceMappingURL=ActorSparqlSerializeSparqlJson.js.map