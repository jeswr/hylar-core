/**
 * Created by Spadon on 11/09/2015.
 */

import * as Logics from './Logics/Logics.js'
import * as Solver from './Logics/Solver'
import * as Utils from './Utils'
import q from 'q'
import Fact from './Logics/Fact.js'
import { displayError } from './Errors'

import { owl2rl } from './Rules'

/**
 * Reasoning engine containing incremental algorithms
 * and heuristics for KB view maintaining.
 */

/**
 * A naive reasoner that recalculates the entire knowledge base.
 * @deprecated
 * @param triplesIns
 * @param triplesDel
 * @param rules
 * @returns {{fi: *, fe: *}}
 */
export function naive (FeAdd, FeDel, F, R) {
  let FiAdd = []
  let Fe = Logics.getOnlyExplicitFacts(F)
  let FiAddNew = []

  // Deletion
  if (FeDel && FeDel.length) {
    Fe = Logics.minus(Fe, FeDel)
  }

  // Insertion
  if (FeAdd && FeAdd.length) {
    Fe = Utils.uniques(Fe, FeAdd)
  }

  // Recalculation
  do {
    FiAdd = Utils.uniques(FiAdd, FiAddNew)
    FiAddNew = Solver.evaluateRuleSet(R, Utils.uniques(Fe, FiAdd))
  } while (!Logics.containsFacts(FiAdd, FiAddNew))

  const additions = Utils.uniques(FeAdd, FiAdd)
  const deletions = Logics.minus(F, Utils.uniques(Fe, FiAdd))

  F = Utils.uniques(Fe, FiAdd)

  return {
    additions: additions,
    deletions: deletions,
    updatedF: F
  }
}

/**
 * Incremental reasoning which avoids complete recalculation of facts.
 * Concat is preferred over merge for evaluation purposes.
 * @param R set of rules
 * @param F set of assertions
 * @param FeAdd set of assertions to be added
 * @param FeDel set of assertions to be deleted
 */
export function incremental (FeAdd, FeDel, F, R) {
  let Rdel = []
  let Rred = []
  let Rins = []
  let FiDel = []
  let FiAdd = []
  let FiDelNew = []
  let FiAddNew = []
  let superSet = []
  let additions
  let deletions
  let Fe = Logics.getOnlyExplicitFacts(F)
  let Fi = Logics.getOnlyImplicitFacts(F)
  const deferred = q.defer()

  const startAlgorithm = function () {
    overDeletionEvaluationLoop()
  }

  const overDeletionEvaluationLoop = function () {
    FiDel = Utils.uniques(FiDel, FiDelNew)
    Rdel = Logics.restrictRuleSet(R, Utils.uniques(FeDel, FiDel))
    Solver.evaluateRuleSet(Rdel, Utils.uniques(Utils.uniques(Fi, Fe), FeDel))
      .then(function (values) {
        FiDelNew = values.cons
        if (Utils.uniques(FiDel, FiDelNew).length > FiDel.length) {
          overDeletionEvaluationLoop()
        } else {
          Fe = Logics.minus(Fe, FeDel)
          Fi = Logics.minus(Fi, FiDel)
          rederivationEvaluationLoop()
        }
      })
  }

  const rederivationEvaluationLoop = function () {
    FiAdd = Utils.uniques(FiAdd, FiAddNew)
    Rred = Logics.restrictRuleSet(R, FiDel)
    Solver.evaluateRuleSet(Rred, Utils.uniques(Fe, Fi))
      .then(function (values) {
        FiAddNew = values.cons
        if (Utils.uniques(FiAdd, FiAddNew).length > FiAdd.length) {
          rederivationEvaluationLoop()
        } else {
          insertionEvaluationLoop()
        }
      })
  }

  const insertionEvaluationLoop = function () {
    FiAdd = Utils.uniques(FiAdd, FiAddNew)
    superSet = Utils.uniques(Utils.uniques(Utils.uniques(Fe, Fi), FeAdd), FiAdd)
    Rins = Logics.restrictRuleSet(R, superSet)
    Solver.evaluateRuleSet(Rins, superSet)
      .then(function (values) {
        FiAddNew = values.cons
        if (!Utils.containsSubset(FiAdd, FiAddNew)) {
          insertionEvaluationLoop()
        } else {
          additions = Utils.uniques(FeAdd, FiAdd)
          deletions = Utils.uniques(FeDel, FiDel)
          deferred.resolve({
            additions: additions,
            deletions: deletions
          })
        }
      }).fail(function (err) {
        displayError(err)
      })
  }

  startAlgorithm()
  return deferred.promise
}

/**
 * Returns valid facts using explicit facts' validity tags.
 * @param F
 * @param refs
 * @returns {Array}
 */
export function tagFilter (F) {
  const validSet = []
  for (let i = 0; i < F.length; i++) {
    if (F[i].isValid()) {
      validSet.push(F[i])
    }
  }
  return validSet
}

/**
 * Tags newly inferred facts, and (un)validates updated ones.
 * Explicit facts are 'validity'-tagged, while
 * implicit ones are 'causedBy'-tagged.
 * @param FeAdd
 * @param FeDel
 * @param F
 * @param R
 * @returns {{additions: *, deletions: Array}}
 */
export function tagging (FeAdd, FeDel, F, R) {
  const newExplicitFacts
  const resolvedExplicitFacts
  let validUpdateResults
  let FiAdd = []
  let Rins = []
  const deferred = q.defer()
  const Fi = Logics.getOnlyImplicitFacts(F)

  const startAlgorithm = function () {
    if (newExplicitFacts.length > 0) {
      evaluationLoop()
    } else {
      deferred.resolve({
        additions: resolvedExplicitFacts,
        deletions: []
      })
    }
  }

  const evaluationLoop = function () {
    F = Utils.uniques(F, Fi)
    Rins = Logics.restrictRuleSet(R, F)
    Solver.evaluateRuleSet(Rins, F, true)
      .then(function (values) {
        FiAdd = values.cons
        if (Logics.unify(FiAdd, Fi)) {
          setTimeout(evaluationLoop, 1)
        } else {
          deferred.resolve({
            additions: newExplicitFacts.concat(resolvedExplicitFacts, Fi),
            deletions: []
          })
        }
      })
  }

  // Returns new explicit facts to be added
  validUpdateResults = Logics.updateValidTags(F, FeAdd, FeDel)
  newExplicitFacts = validUpdateResults.new
  resolvedExplicitFacts = validUpdateResults.resolved
  F = F.concat(newExplicitFacts)
  startAlgorithm()

  return deferred.promise
}

const facts = [
  new Fact('#parentOf', '#papy', '#papa', [], true),
  new Fact('#parentOf', '#papa', '#fiston', [], true),
  new Fact('#parentOf', '#grandpapy', '#papy', [], true),
  new Fact('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', '#parentOf', 'http://www.w3.org/2002/07/owl#TransitiveProperty', [], true)
]

incremental(facts, [], [], owl2rl).then(function (consequences) {
  consequences.additions.length.should.equal(7)
})
