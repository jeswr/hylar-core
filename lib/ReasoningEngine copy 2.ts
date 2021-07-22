/* eslint-disable no-await-in-loop */
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
  let FiDel: Fact[] = [];
  let FiAdd: Fact[] = [];
  let FiDelNew: Fact[] = [];
  let FiAddNew: Fact[] = [];
  let Fe: Fact[] = FactExplicit;
  let Fi: Fact[] = FactImplicit;

  let F = Utils.uniques(Fi, Fe);

  do {
    FiDel = Utils.uniques(FiDel, FiDelNew);
    FiDelNew = await Solver.evaluateRuleSet(
      Logics.restrictRuleSet(R, Utils.uniques(FeDel, FiDel)),
      Utils.uniques(Fi, Fe, FeDel),
    );
  } while (Utils.uniques(FiDel, FiDelNew).length > FiDel.length);

  Fe = Logics.minus(Fe, FeDel); Fi = Logics.minus(Fi, FiDel); F = Utils.uniques(Fi, Fe);

  do {
    FiAdd = Utils.uniques(FiAdd, FiAddNew);
    // TODO: Double check this
    FiAddNew = await Solver.evaluateRuleSet(Logics.restrictRuleSet(R, FiDel), F);
  } while (Utils.uniques(FiAdd, FiAddNew).length > FiAdd.length);

  do {
    FiAdd = Utils.uniques(FiAdd, FiAddNew);
    const superSet = Utils.uniques(Fe, Fi, FeAdd, FiAdd);
    FiAddNew = await Solver.evaluateRuleSet(Logics.restrictRuleSet(R, superSet), superSet);
  } while (!Utils.containsSubset(FiAdd, FiAddNew));

  return {
    additions: Utils.uniques(FeAdd, FiAdd),
    deletions: Utils.uniques(FeDel, FiDel),
  };
}
