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

function unionSE<T>(a: Map<string, T>, ...r: Map<string, T>[]): Map<string, T> {
  for (const b of r) {
    for (const key in b) a[key] = b[key];
  }
  return a;
}

function union<T>(...r: Map<string, T>[]): Map<string, T> {
  return union(new Map(), ...r);
}

// eslint-disable-next-line import/prefer-default-export
export async function incremental(
  FeAdd: Fact[],
  FeDel?: Fact[],
  FactExplicit?: Map<string, Fact>,
  FactImplicit?: Map<string, Fact>,
  R?: Rule[],
):
  Promise<{ additions: Fact[], deletions: Fact[] }> {
  let FiDel = new Map<string, Fact>();
  let FiAdd = new Map<string, Fact>();
  let FiDelNew = new Map<string, Fact>();
  let FiAddNew = new Map<string, Fact>();
  let Fe: Map<string, Fact> = FactExplicit;
  let Fi: Map<string, Fact> = FactImplicit;

  let F = union(Fi, Fe);

  do {
    FiDel = unionSE(FiDel, FiDelNew);
    FiDelNew = await Solver.evaluateRuleSet(
      Logics.restrictRuleSet(R, union(FeDel, FiDel).values()),
      union(F, FeDel).values(),
    );
  } while (union(FiDel, FiDelNew).length > FiDel.length);

  Fe = Logics.minus(Fe, FeDel); Fi = Logics.minus(Fi, FiDel); F = union(Fi, Fe);

  do {
    FiAdd = unionSE(FiAdd, FiAddNew);
    // TODO: Double check this
    FiAddNew = await Solver.evaluateRuleSet(Logics.restrictRuleSet(R, FiDel), F);
  } while (union(FiAdd, FiAddNew).length > FiAdd.length);

  do {
    FiAdd = unionSE(FiAdd, FiAddNew);
    const superSet = union(Fe, Fi, FeAdd, FiAdd);
    FiAddNew = await Solver.evaluateRuleSet(Logics.restrictRuleSet(R, superSet), superSet);
  } while (!Utils.containsSubset(FiAdd, FiAddNew));

  return {
    additions: union(FeAdd, FiAdd),
    deletions: union(FeDel, FiDel),
  };
}
