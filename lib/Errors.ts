/**
 * Created by aifb on 02.05.16.
 */

import type Fact from './Logics/Fact';

export function IllegalFact(fact: Fact) {
  return new Error(`Illegal fact: ${fact.toString()}`);
}

export function OrphanImplicitFact() {
  return new Error('Implicit facts could not have empty causes.');
}

export function StorageNotInitialized() {
  return new Error('Storage has not been initialized. Please load an ontology first.');
}

export function FileIO(filename: string) {
  return new Error(`Cannot access ${filename}`);
}

export function DBParsing(filename: string) {
  return new Error(`Cannot parse '${filename}' as graph database.`);
}

export function CountNotImplemented(expr: string) {
  return new Error(`COUNT statement currently only supports single wildcard (*) counts, got '${expr}'`);
}
