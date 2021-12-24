import { namedNode, quad, variable, blankNode } from '@rdfjs/data-model';
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
  // Probably better as a store
  let allPatterns = [...patterns];
  let substitutedRules: Rule[] = [];
  let size: number = -1;
  // For each rule, filter to only care about the *consequents* in allPatterns
  while (size < substitutedRules.length) {
  for (const rule of rules) {
    for (const conclusion of rule.conclusion) {
      for (const pattern of allPatterns) {
        if (matches(conclusion, pattern)) {
          const substituted = substitute(rule.premise, conclusion, pattern)
          substitutedRules.push(substituted)
          allPatterns = allPatterns.concat(substituted.premise)
        }
      }
    }
  }
}
return substitutedRules
}

// type Links = {
  // quad: RDF.Quad;
  // link: LI
// }[]

// Data structure for rule tree
interface Link { 
  quad: RDF.Quad;
  link: Links | false
}

interface Links {
  quads: Link[];
}

// TODO: Find a way to skolemize rules
function m() {

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

function substitute(premises: RDF.Quad[], consequent: RDF.Quad, pattern: RDF.Quad): Rule {
  const localMapping: Mapping = {};
  const takenVars: { [key: string]: boolean } = {};
  const newPremises: RDF.Quad[] = [];
  let varCount = 0;

  function factElemMatches(factElem: RDF.Term, causeElem: RDF.Term) {
    if (causeElem.termType === 'Variable') {
      localMapping[causeElem.value] = factElem;
      if (factElem.termType === 'Variable') {
        takenVars[factElem.value] = true;
      }
    }
  }

  factElemMatches(pattern.predicate, consequent.predicate)
  factElemMatches(pattern.object, consequent.object)
  factElemMatches(pattern.subject, consequent.subject)
  factElemMatches(pattern.graph, consequent.graph)

  function matcher(term: RDF.Term) {
    if (term.termType !== 'Variable') {
      return term;
    }

    if (term.value in localMapping) {
      return localMapping[term.value]
    }

    if (term.value in takenVars) {
      let name: string;
      while((name = `?v${varCount}`) in takenVars) {
        varCount += 1;
      }
      takenVars[name] = true;
      localMapping[term.value] = variable(name);
      return localMapping[term.value];
    }

    return term;
  }
  
  // function matcher(term: RDF.Term) {
  //   if (term.termType !== 'Variable') {
  //     return term;
  //   }

  //   if (term.value in localMapping) {
  //     return localMapping[term.value]
  //   }

  //   if (term.value in takenVars) {
  //     while(`?v${varCount}` in takenVars) {
  //       varCount += 1;
  //     }
  //     takenVars[`?v${varCount}`] = true;
  //     localMapping[term.value] = variable(`?v${varCount}`);
  //     return localMapping[term.value];
  //   }

  //   return term;
  // }
  // rule.conclusion
  // TODO Double check
  // const mapping = getLocalMapping(pattern, consequent);
  // We need to make sure that we don't map *to* any existing variables
  // let varCount = 0
  for (const premise of premises) {
    const q = quad<RDF.BaseQuad>(
      matcher(premise.subject),
      matcher(premise.predicate),
      matcher(premise.object),
      matcher(premise.graph),
    )
    // @ts-ignore: TODO: Apply is-quad check
    newPremises.push(q);
  }

  return {
    premise: premises,
    conclusion: [pattern],
  }
  
  // mapping[]
}


// export function substitute(elem: RDF.Term, mapping: Mapping): RDF.Term {
//   // TODO: See if this is necessary
//   if (elem.termType === 'BlankNode') return blankNode();
//   if (elem.termType === 'Variable') {
//     if (!(elem.value in mapping)) {
//       throw new Error('Variable not found in mapping');
//     }
//     return mapping[elem.value];
//   }
//   return elem;
// }

// export function substituteQuad(mapping: Mapping, term: RDF.Quad) {
//   return quad(
//     // @ts-ignore
//     substitute(term.subject, mapping),
//     substitute(term.predicate, mapping),
//     substitute(term.object, mapping),
//     substitute(term.graph, mapping),
//   );
// }

// Test 1
// Test cases
const pattern = quad(
  namedNode('Jesse'),
  namedNode('a'),
  variable('?o'),
  variable('?g')
)

// Input rule
const rule = {
  premise: [
    quad(
      variable('?s'),
      namedNode('a'),
      variable('?o'),
      variable('?g')
    ),
    quad(
      variable('?o'),
      namedNode('subsetOf'),
      variable('?o2'),
      namedNode('?g')
    )
  ],
  conclusion: [
    quad(
      variable('?s'),
      namedNode('a'),
      variable('?o2'),
      variable('?g')
    ),
  ]
}

// Output rule
const ruleOut = {
  premise: [
    quad(
      variable('Jesse'),
      namedNode('a'),
      variable('?o'),
      variable('?g')
    ),
    quad(
      variable('?o'),
      namedNode('subsetOf'),
      variable('?o2'),
      namedNode('?g')
    )
  ],
  conclusion: [
    quad(
      variable('Jesse'),
      namedNode('a'),
      variable('?o2'),
      variable('?g')
    ),
  ]
}

// Test 2
// Test cases
const pattern2 = quad(
  namedNode('Jesse'),
  namedNode('a'),
  variable('?o'),
  variable('?g')
)

// Input rule
const rule2 = {
  premise: [
    quad(
      variable('?s'),
      namedNode('a'),
      variable('?o2'),
      variable('?g')
    ),
    quad(
      variable('?o2'),
      namedNode('subsetOf'),
      variable('?o'),
      namedNode('?g')
    )
  ],
  conclusion: [
    quad(
      variable('?s'),
      namedNode('a'),
      variable('?o'),
      variable('?g')
    ),
  ]
}

// Output rule
const ruleOut2 = {
  premise: [
    quad(
      variable('Jesse'),
      namedNode('a'),
      variable('?o2'),
      variable('?g')
    ),
    quad(
      variable('?o2'),
      namedNode('subsetOf'),
      variable('?0'),
      namedNode('?g')
    )
  ],
  conclusion: [
    quad(
      variable('Jesse'),
      namedNode('a'),
      variable('?o'),
      variable('?g')
    ),
  ]
}

// Test 3
// Test cases
// TODO: FINISH
const pattern3 = quad(
  namedNode('?o'),
  namedNode('a'),
  variable('?o'),
  variable('?g')
)

// Input rule
const rule3 = {
  premise: [
    quad(
      variable('?s'),
      namedNode('a'),
      variable('?o'),
      variable('?g')
    ),
    quad(
      variable('?o'),
      namedNode('subsetOf'),
      variable('?o2'),
      namedNode('?g')
    )
  ],
  conclusion: [
    quad(
      variable('?s'),
      namedNode('a'),
      variable('?o2'),
      variable('?g')
    ),
  ]
}

// Output rule
const ruleOut3 = {
  premise: [
    quad(
      variable('Jesse'),
      namedNode('a'),
      variable('?o'),
      variable('?g')
    ),
    quad(
      variable('?o'),
      namedNode('subsetOf'),
      variable('?o2'),
      namedNode('?g')
    )
  ],
  conclusion: [
    quad(
      variable('Jesse'),
      namedNode('a'),
      variable('?o2'),
      variable('?g')
    ),
  ]
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

