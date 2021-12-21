import type * as RDF from '@rdfjs/types';

export interface Rule {
  premise: RDF.Quad[];
  conclusion: RDF.Quad[] | false;
}

/**
 * A lazy quad source.
 */
 export interface IQuadSource {
  /**
   * Returns a (possibly lazy) stream that processes all quads matching the pattern.
   *
   * The returned stream MUST expose the property 'metadata'.
   * The implementor is reponsible for handling cases where 'metadata'
   * is being called without the stream being in flow-mode.
   *
   * @param {RDF.Term} subject   The exact subject to match, variable is wildcard.
   * @param {RDF.Term} predicate The exact predicate to match, variable is wildcard.
   * @param {RDF.Term} object    The exact object to match, variable is wildcard.
   * @param {RDF.Term} graph     The exact graph to match, variable is wildcard.
   * @return {AsyncIterator<RDF.Quad>} The resulting quad stream.
   */
  match: (subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph: RDF.Term) => AsyncIterator<RDF.Quad>;
}
