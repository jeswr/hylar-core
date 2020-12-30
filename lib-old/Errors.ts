/**
 * Created by aifb on 02.05.16.
 */

import Fact from './Logics/Fact'

export default {
  IllegalFact (fact: Fact) {
    return new Error(`Illegal fact: ${fact.toString()}`)
  },

  OrphanImplicitFact () {
    return new Error('Implicit facts could not have empty causes.')
  },

  StorageNotInitialized () {
    return new Error('Storage has not been initialized. Please load an ontology first.')
  },

  FileIO (filename: string) {
    return new Error(`Cannot access ${filename}`)
  },

  DBParsing (filename: string) {
    return new Error(`Cannot parse '${filename}' as graph database.`)
  },

  CountNotImplemented (expr: string) {
    return new Error(`COUNT statement currently only supports single wildcard (*) counts, got '${expr}'`)
  }
}
