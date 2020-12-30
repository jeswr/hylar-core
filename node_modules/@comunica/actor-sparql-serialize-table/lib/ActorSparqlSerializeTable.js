"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorSparqlSerializeTable = void 0;
const stream_1 = require("stream");
const bus_sparql_serialize_1 = require("@comunica/bus-sparql-serialize");
const rdf_terms_1 = require("rdf-terms");
/**
 * A comunica Table Sparql Serialize Actor.
 */
class ActorSparqlSerializeTable extends bus_sparql_serialize_1.ActorSparqlSerializeFixedMediaTypes {
    constructor(args) {
        super(args);
        this.padding = ActorSparqlSerializeTable.repeat(' ', this.columnWidth);
    }
    static repeat(str, count) {
        return new Array(count + 1).join(str);
    }
    async testHandleChecked(action, context) {
        if (!['bindings', 'quads'].includes(action.type)) {
            throw new Error('This actor can only handle bindings or quad streams.');
        }
        return true;
    }
    pad(str) {
        if (str.length <= this.columnWidth) {
            return str + this.padding.slice(str.length);
        }
        return `${str.slice(0, this.columnWidth - 1)}…`;
    }
    pushHeader(data, labels) {
        const header = labels.map(label => this.pad(label)).join(' ');
        data.push(`${header}\n${ActorSparqlSerializeTable.repeat('-', header.length)}\n`);
    }
    pushRow(data, labels, bindings) {
        data.push(`${labels
            .map(label => bindings.has(label) ? bindings.get(label).value : '')
            .map(label => this.pad(label))
            .join(' ')}\n`);
    }
    async runHandle(action, mediaType, context) {
        const data = new stream_1.Readable();
        data._read = () => {
            // Do nothing
        };
        let resultStream;
        if (action.type === 'bindings') {
            resultStream = action.bindingsStream;
            const labels = action.variables;
            this.pushHeader(data, labels);
            resultStream.on('error', error => data.emit('error', error));
            resultStream.on('data', bindings => this.pushRow(data, labels, bindings));
        }
        else {
            resultStream = action.quadStream;
            this.pushHeader(data, rdf_terms_1.QUAD_TERM_NAMES);
            resultStream.on('error', error => data.emit('error', error));
            resultStream.on('data', quad => data.push(`${rdf_terms_1.getTerms(quad).map(term => this.pad(term.value)).join(' ')}\n`));
        }
        resultStream.on('end', () => data.push(null));
        return { data };
    }
}
exports.ActorSparqlSerializeTable = ActorSparqlSerializeTable;
//# sourceMappingURL=ActorSparqlSerializeTable.js.map