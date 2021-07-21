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
 * Incremental reasoning which avoids complete recalculation of facts.
 * Concat is preferred over merge for evaluation purposes.
 * @param FeAdd set of assertions to be added
 * @param FeDel set of assertions to be deleted
 * @param FactExplicit set of assertions (explicit)
 * @param FactImplicit set of assertions (implicit)
 * @param R set of rules
 */
// eslint-disable-next-line import/prefer-default-export
export async function incremental(
  FeAdd: Fact[],
  FeDel?: Fact[],
  FactExplicit?: Fact[],
  FactImplicit?: Fact[],
  R?: Rule[],
):
  Promise<{ additions: Fact[], deletions: Fact[] }> {
  return new Promise((resolve) => {
    let FiDel: Fact[] = [];
    let FiAdd: Fact[] = [];
    let FiDelNew: Fact[] = [];
    let FiAddNew: Fact[] = [];
    let Fe: Fact[] = FactExplicit;
    let Fi: Fact[] = FactImplicit;

    async function overDeletionEvaluationLoop() {
      FiDel = Utils.uniques(FiDel, FiDelNew);

      const values = await Solver.evaluateRuleSet(
        Logics.restrictRuleSet(R, Utils.uniques(FeDel, FiDel)),
        Utils.uniques(Utils.uniques(Fi, Fe), FeDel),
      );

      FiDelNew = values.cons;
      if (Utils.uniques(FiDel, FiDelNew).length > FiDel.length) {
        await overDeletionEvaluationLoop();
      } else {
        Fe = Logics.minus(Fe, FeDel);
        Fi = Logics.minus(Fi, FiDel);
        rederivationEvaluationLoop();
      }
    }

    async function rederivationEvaluationLoop() {
      FiAdd = Utils.uniques(FiAdd, FiAddNew);
      const values = await Solver.evaluateRuleSet(
        Logics.restrictRuleSet(R, FiDel), Utils.uniques(Fe, Fi),
      );
      FiAddNew = values.cons;
      if (Utils.uniques(FiAdd, FiAddNew).length > FiAdd.length) {
        await rederivationEvaluationLoop();
      } else {
        insertionEvaluationLoop();
      }
    }

    async function insertionEvaluationLoop() {
      FiAdd = Utils.uniques(FiAdd, FiAddNew);
      const superSet = Utils.uniques(Utils.uniques(Utils.uniques(Fe, Fi), FeAdd), FiAdd);
      const values = await Solver.evaluateRuleSet(Logics.restrictRuleSet(R, superSet), superSet);
      FiAddNew = values.cons;
      if (!Utils.containsSubset(FiAdd, FiAddNew)) {
        await insertionEvaluationLoop();
      } else {
        resolve({
          additions: Utils.uniques(FeAdd, FiAdd),
          deletions: Utils.uniques(FeDel, FiDel),
        });
      }
    }
    overDeletionEvaluationLoop();
  });
}
