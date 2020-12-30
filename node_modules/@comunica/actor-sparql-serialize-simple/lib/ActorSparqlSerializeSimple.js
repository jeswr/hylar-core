"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorSparqlSerializeSimple = void 0;
const stream_1 = require("stream");
const bus_sparql_serialize_1 = require("@comunica/bus-sparql-serialize");
/**
 * A comunica Simple Sparql Serialize Actor.
 */
class ActorSparqlSerializeSimple extends bus_sparql_serialize_1.ActorSparqlSerializeFixedMediaTypes {
    constructor(args) {
        super(args);
    }
    async testHandleChecked(action, context) {
        if (!['bindings', 'quads', 'boolean'].includes(action.type)) {
            throw new Error('This actor can only handle bindings streams, quad streams or booleans.');
        }
        return true;
    }
    async runHandle(action, mediaType, context) {
        const data = new stream_1.Readable();
        data._read = () => {
            // Do nothing
        };
        let resultStream;
        if (action.type === 'bindings') {
            resultStream = action.bindingsStream;
            resultStream.on('error', error => data.emit('error', error));
            resultStream.on('data', bindings => data.push(`${bindings.map((value, key) => `${key}: ${value.value}`).join('\n')}\n\n`));
            resultStream.on('end', () => data.push(null));
        }
        else if (action.type === 'quads') {
            resultStream = action.quadStream;
            resultStream.on('error', error => data.emit('error', error));
            resultStream.on('data', quad => data.push(`subject: ${quad.subject.value}\n` +
                `predicate: ${quad.predicate.value}\n` +
                `object: ${quad.object.value}\n` +
                `graph: ${quad.graph.value}\n\n`));
            resultStream.on('end', () => data.push(null));
        }
        else {
            try {
                data.push(`${JSON.stringify(await action.booleanResult)}\n`);
                data.push(null);
            }
            catch (error) {
                setImmediate(() => data.emit('error', error));
            }
        }
        return { data };
    }
}
exports.ActorSparqlSerializeSimple = ActorSparqlSerializeSimple;
//# sourceMappingURL=ActorSparqlSerializeSimple.js.map