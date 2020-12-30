"use strict";
/**
 * Created by mt on 23/11/2015.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Main prefixes used in the store.
 * @type {{OWL: string, RDF: string, RDFS: string, FIPA: string}}
 */
const RegularExpressions_1 = __importDefault(require("./RegularExpressions"));
class Prefixes {
    constructor() {
        this.counter = 0;
        this.prefixes = {
            owl: 'http://www.w3.org/2002/07/owl#',
            rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
            hax: 'http://ucbl.github.io/HyLAR-Reasoner/axioms/',
        };
    }
    forgeCustomPrefix() {
        return `h${this.counter++}`;
    }
    add(prefix, uri) {
        this.prefixes[prefix] = uri;
    }
    get(prefix) {
        return prefix in this.prefixes ? this.prefixes[prefix] : `${prefix}:`;
    }
    entries() {
        return this.prefixes;
    }
    replaceUriWithPrefix(uri) {
        for (const [prefix, uriRef] of Object.entries(this.prefixes)) {
            if (uri.indexOf(uriRef) === 0) {
                return uri.replace(new RegExp(`^${uriRef}`), `${prefix}:`);
            }
        }
        return uri;
    }
    replacePrefixWithUri(prefixedUri, prefix) {
        return prefixedUri.replace(new RegExp(`^${prefix}:`), this.get(prefix));
    }
    registerPrefixFrom(fact) {
        const prefixedURIs = Object.values(this.prefixes);
        for (const atom of [fact.subject, fact.predicate, fact.object]) {
            if (!prefixedURIs.includes(atom)) {
                this.add(this.forgeCustomPrefix(), atom.replace(RegularExpressions_1.default.URI_AFTER_HASH_OR_SLASH, ''));
            }
        }
    }
}
exports.default = new Prefixes();
