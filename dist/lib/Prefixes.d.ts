/**
 * Created by mt on 23/11/2015.
 */
declare class Prefixes {
    counter: number;
    prefixes: {
        owl: string;
        rdf: string;
        rdfs: string;
        hax: string;
    };
    constructor();
    forgeCustomPrefix(): string;
    add(prefix: any, uri: any): void;
    get(prefix: any): any;
    entries(): {
        owl: string;
        rdf: string;
        rdfs: string;
        hax: string;
    };
    replaceUriWithPrefix(uri: any): any;
    replacePrefixWithUri(prefixedUri: any, prefix: any): any;
    registerPrefixFrom(fact: any): void;
}
declare const _default: Prefixes;
export default _default;
