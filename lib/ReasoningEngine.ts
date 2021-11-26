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

function add<T>(a: Map<string, T>, b: T[]): Map<string, T> {
  for (const elem of b) a[`${elem}`] = b;
  return a;
}

// eslint-disable-next-line import/prefer-default-export
export async function incremental(
  FeAdd: Map<string, Fact>,
  FeDel?: Map<string, Fact>,
  FactExplicit?: Map<string, Fact>,
  FactImplicit?: Map<string, Fact>,
  R?: Rule[],
): Promise<{ additions: Map<string, Fact>, deletions: Map<string, Fact> }> {
  let size: number;

  let FiDel = new Map<string, Fact>();
  let FiAdd = new Map<string, Fact>();
  let Fe: Map<string, Fact> = FactExplicit;
  let Fi: Map<string, Fact> = FactImplicit;

  let F = union(Fi, Fe);

  do {
    size = FiDel.size;
    FiDel = add(FiDel, await Solver.evaluateRuleSet(
      Logics.restrictRuleSet(R, union(FeDel, FiDel).values()),
      union(F, FeDel).values(),
    ));
  } while (FiDel.size > size);

  Fe = unionSE(Fe, FeDel); Fi = unionSE(Fi, FiDel); F = union(Fi, Fe);

  do {
    size = FiAdd.size;
    FiAdd = add(
      FiAdd,
      await Solver.evaluateRuleSet(Logics.restrictRuleSet(R, FiDel.values()), F.values()),
    );
  } while (FiAdd.size > size);

  F = unionSE(F, FeAdd);

  do {
    size = 0;
    FiAdd = unionSE(F, FiAdd);
    for (const rule of await Solver.evaluateRuleSet(Logics.restrictuleSet(R, F.values()), F.values())) {
      const str = `${rule}`;
      if (str in F) size = 1;
    }
  } while (size > 0);

  return {
    additions: { implicit: FiAdd, explicit: FeAdd },
    deletions: { implicit: FiDel, explicit: FeDel },
  };
}
