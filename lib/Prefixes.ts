/**
 * Created by mt on 23/11/2015.
 */

/**
 * Main prefixes used in the store.
 * @type {{OWL: string, RDF: string, RDFS: string, FIPA: string}}
 */

const prefixes = {
  owl: 'http://www.w3.org/2002/07/owl#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  hax: 'http://ucbl.github.io/HyLAR-Reasoner/axioms/',
};

// eslint-disable-next-line import/prefer-default-export
export function replacePrefixWithUri(prefixedUri: string, prefix: string) {
  return prefixedUri.replace(new RegExp(`^${prefix}:`), prefixes[prefix]);
}
