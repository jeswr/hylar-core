"use strict";
/**
 * Created by aifb on 02.05.16.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountNotImplemented = exports.DBParsing = exports.FileIO = exports.StorageNotInitialized = exports.OrphanImplicitFact = exports.IllegalFact = void 0;
function IllegalFact(fact) {
    return new Error(`Illegal fact: ${fact.toString()}`);
}
exports.IllegalFact = IllegalFact;
function OrphanImplicitFact() {
    return new Error('Implicit facts could not have empty causes.');
}
exports.OrphanImplicitFact = OrphanImplicitFact;
function StorageNotInitialized() {
    return new Error('Storage has not been initialized. Please load an ontology first.');
}
exports.StorageNotInitialized = StorageNotInitialized;
function FileIO(filename) {
    return new Error(`Cannot access ${filename}`);
}
exports.FileIO = FileIO;
function DBParsing(filename) {
    return new Error(`Cannot parse '${filename}' as graph database.`);
}
exports.DBParsing = DBParsing;
function CountNotImplemented(expr) {
    return new Error(`COUNT statement currently only supports single wildcard (*) counts, got '${expr}'`);
}
exports.CountNotImplemented = CountNotImplemented;
