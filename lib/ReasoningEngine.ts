/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/**
 * Created by Spadon on 11/09/2015.
 */

import Fact from './Logics/Fact';
import * as Logics from './Logics/Logics';
import Rule from './Logics/Rule';
import * as Solver from './Logics/Solver';
import * as Utils from './Utils';

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
export async function naive(FeAdd: Fact[], FeDel: Fact[], F, R) {
  let FiAdd = [];
  let Fe = Logics.getOnlyExplicitFacts(F);
  let FiAddNew;

  // Deletion
  if (FeDel?.length) {
    Fe = Logics.minus(Fe, FeDel);
  }

  // Insertion
  if (FeAdd?.length) {
    Fe = Utils.uniques(Fe, FeAdd);
  }

  // Recalculation
  do {
    FiAdd = Utils.uniques(FiAdd, FiAddNew);
    // eslint-disable-next-line no-await-in-loop
    FiAddNew = await Solver.evaluateRuleSet(R, Utils.uniques(Fe, FiAdd));
  } while (!Logics.containsFacts(FiAdd, FiAddNew));

  const additions: Fact[] = Utils.uniques(FeAdd, FiAdd);
  const deletions: Fact[] = Logics.minus(F, Utils.uniques(Fe, FiAdd));

  F = Utils.uniques(Fe, FiAdd);

  return {
    additions,
    deletions,
    updatedF: F,
  };
}

/**
 * Incremental reasoning which avoids complete recalculation of facts.
 * Concat is preferred over merge for evaluation purposes.
 * @param FeAdd set of assertions to be added
 * @param FeDel set of assertions to be deleted
 * @param FactExplicit set of assertions (explicit)
 * @param FactImplicit set of assertions (implicit)
 * @param R set of rules
 */
export async function incremental(
  FeAdd: Fact[],
  FeDel?: Fact[],
  FactExplicit?: Fact[],
  FactImplicit?: Fact[],
  R?: Rule[],
):
  Promise<{ additions: Fact[], deletions: Fact[] }> {
  return new Promise((resolve) => {
    let Rdel = [];
    let Rred = [];
    let Rins = [];
    let FiDel = [];
    let FiAdd = [];
    let FiDelNew = [];
    let FiAddNew = [];
    let superSet = [];
    let additions;
    let deletions;
    let Fe = FactExplicit;
    let Fi = FactImplicit;

    function startAlgorithm() {
      overDeletionEvaluationLoop();
    }

    function overDeletionEvaluationLoop() {
      FiDel = Utils.uniques(FiDel, FiDelNew);
      Rdel = Logics.restrictRuleSet(R, Utils.uniques(FeDel, FiDel));
      Solver.evaluateRuleSet(Rdel, Utils.uniques(Utils.uniques(Fi, Fe), FeDel))
        .then((values) => {
          FiDelNew = values.cons;
          if (Utils.uniques(FiDel, FiDelNew).length > FiDel.length) {
            overDeletionEvaluationLoop();
          } else {
            Fe = Logics.minus(Fe, FeDel);
            Fi = Logics.minus(Fi, FiDel);
            rederivationEvaluationLoop();
          }
        });
    }

    function rederivationEvaluationLoop() {
      FiAdd = Utils.uniques(FiAdd, FiAddNew);
      Rred = Logics.restrictRuleSet(R, FiDel);
      Solver.evaluateRuleSet(Rred, Utils.uniques(Fe, Fi))
        .then((values) => {
          FiAddNew = values.cons;
          if (Utils.uniques(FiAdd, FiAddNew).length > FiAdd.length) {
            rederivationEvaluationLoop();
          } else {
            insertionEvaluationLoop();
          }
        });
    }

    function insertionEvaluationLoop() {
      FiAdd = Utils.uniques(FiAdd, FiAddNew);
      superSet = Utils.uniques(Utils.uniques(Utils.uniques(Fe, Fi), FeAdd), FiAdd);
      Rins = Logics.restrictRuleSet(R, superSet);
      Solver.evaluateRuleSet(Rins, superSet)
        .then((values) => {
          FiAddNew = values.cons;
          if (!Utils.containsSubset(FiAdd, FiAddNew)) {
            insertionEvaluationLoop();
          } else {
            additions = Utils.uniques(FeAdd, FiAdd);
            deletions = Utils.uniques(FeDel, FiDel);
            resolve({
              additions,
              deletions,
            });
          }
        });
    }
    startAlgorithm();
  });
}

/**
 * Returns valid facts using explicit facts' validity tags.
 * @param F
 * @param refs
 * @returns {Array}
 */
export function tagFilter(F) {
  return F.filter((f) => f.isValid());
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
export function tagging(FeAdd, FeDel, F, R) {
  let newExplicitFacts;
  let resolvedExplicitFacts;
  let validUpdateResults;
  let FiAdd = [];
  let Rins = [];
  const Fi = Logics.getOnlyImplicitFacts(F);

  return new Promise((resolve) => {
    function startAlgorithm() {
      if (newExplicitFacts.length > 0) {
        evaluationLoop();
      } else {
        resolve({
          additions: resolvedExplicitFacts,
          deletions: [],
        });
      }
    }

    function evaluationLoop() {
      F = Utils.uniques(F, Fi);
      Rins = Logics.restrictRuleSet(R, F);
      Solver.evaluateRuleSet(Rins, F, true)
        .then((values) => {
          FiAdd = values.cons;
          if (Logics.unify(FiAdd, Fi)) {
            setTimeout(evaluationLoop, 1);
          } else {
            resolve({
              additions: newExplicitFacts.concat(resolvedExplicitFacts, Fi),
              deletions: [],
            });
          }
        });
    }

    // Returns new explicit facts to be added
    validUpdateResults = Logics.updateValidTags(F, FeAdd, FeDel);
    newExplicitFacts = validUpdateResults.new;
    resolvedExplicitFacts = validUpdateResults.resolved;
    F = F.concat(newExplicitFacts);
    startAlgorithm();
  });
}

export function updateRuleDependencies(ruleSet) {
  for (const rule of ruleSet) {
    for (const depRule of ruleSet) {
      if (rule.dependsOn(depRule)) {
        depRule.addDependentRule(rule);
      }
    }
  }
}
