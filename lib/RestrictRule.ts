import * as RDF from '@rdfjs/types'
// import { substitute } from '.';
// import { Rule } 

interface Mapping { [key: string]: RDF.Term }

interface Rule {
  premise: RDF.Quad[];
  conclusion: RDF.Quad[];
}

// TODO: Improve this
function termMatches(value: RDF.Term, pattern: RDF.Term) {
  return pattern.termType === 'Variable'
    || value.termType === 'Variable'
    || value.equals(pattern)
}

// This can be improved by ensuring that variable occurences
// match each other similar to in in the HyLAR reasoner
function matches(value: RDF.Quad, pattern: RDF.Quad) {
  return termMatches(value.subject, pattern.subject)
    && termMatches(value.predicate, pattern.predicate)
    && termMatches(value.object, pattern.object)
    && termMatches(value.graph, pattern.graph)
}

/**
 * @param rules The full rule set to be reasoned over
 * @param patterns The patterns that we are to match against in the rule set
 */
function restrictNaive(rules: Rule[], patterns: RDF.Quad[]): RDF.Quad[] {
  let allPatterns = [...patterns];
  let unusedRules = [...rules];
  let unusedRulesNew = [];
  let allRules = [];
  let size = -1;
  while (unusedRules.length > 0 && size < allRules.length) {
    size = allRules.length;
    for (const rule of unusedRules) {
      // Test to see if there is any match
      if (rule.conclusion.some(quad => patterns.some(pattern => matches(quad, pattern)))) {
        allRules.push(rule)
        allPatterns = allPatterns.concat(rule.premise)
      } else {
        unusedRulesNew.push(rule)
      }
    }
    unusedRules = unusedRulesNew
    unusedRulesNew = []
  }
  return allRules
}

function restrictSubstitution(rules: Rule[], patterns: RDF.Quad[]) {
  let allPatterns = [...patterns];
  // For each rule, filter to only care about the *consequents* in allPatterns


}

function getLocalMapping(quad: RDF.Quad, cause: RDF.Quad) {
  const localMapping: Mapping = {};

  function factElemMatches(factElem: RDF.Term, causeElem: RDF.Term) {
    if (causeElem.termType === 'Variable') {
      localMapping[causeElem.value] = factElem;
    }
  }

  factElemMatches(quad.predicate, cause.predicate)
  factElemMatches(quad.object, cause.object)
  factElemMatches(quad.subject, cause.subject)
  factElemMatches(quad.graph, cause.graph)

  return localMapping;
}

function substitute(oremises: RDF.Quad[], consequent: RDF.Quad, pattern: RDF.Quad) {
  // rule.conclusion
  // TODOL Double check
  const mapping = getLocalMapping(pattern, consequent)
}

// This is for (3)
// function substituteTerm() {

// }

// Extensions to this algorithm
// 1 Delete 'unused' consequents (and possibly in turn unused antecedents) from each of the rules
// 2 Create a dependency tree of rule and evaluate things like the hylar engine 'cyclically' on those rules
// 3 "Realise variables in Quad patterns" - for instance, if we have:
// (?p a ?thing) ^ (?thing subClassOf ?thing2) -> (?p a ?thing2), but we only care about the pattern (jesse a ?o) then the rule becomes
// (jesse a ?thing) ^ (?thing subClassOf ?thing2) -> (jesse a ?thing2)
// Depending on the rule set the above evaluation could become quite large in and of itself - probably worthwhile running some benchmarking to see if this is a good approach

// THink about things like 

// Much longer term - *further* rule restriction based on multiple BGP patterns (though this may *not* be strictly necessary depending on how things like Comunica do optimisations)

