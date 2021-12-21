import type { Dataset, Quad } from '@rdfjs/types';
import type { Rule } from './Rule';
import { evaluateRuleSet } from './Solver';

interface incrementalInput {
  implicitSource: Dataset,
  explicitSource: Dataset,
  additions: Quad[],
  deletions: Quad[],
  rules: Rule[]
}

interface incrementalOutput {
  implicit: {
    additions: Dataset,
    deletions: Dataset,
  },
  explicit: {
    additions: Dataset,
    deletions: Dataset
  }
}

export async function incremental(input: incrementalInput, output: incrementalOutput): null {
  const allQuads = input.explicitSource.union(input.implicitSource);


  do {
    size = FiDel.size;
    input.implicitSource.addAll(await evaluateRuleSet(input.rules, allQuads.union(output.explicit.deletions)));
    
    
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

  // return {
  //   additions: { implicit: FiAdd, explicit: FeAdd },
  //   deletions: { implicit: FiDel, explicit: FeDel },
  // };
}



// export async function incremental(input: incrementalInput): Promise<{ additions: Map<string, Fact>, deletions: Map<string, Fact> }> {
//   input.implicitSource.size
  
  
//   let size: number;

//   let FiDel = new Map<string, Fact>();
//   let FiAdd = new Map<string, Fact>();
//   let Fe: Map<string, Fact> = FactExplicit;
//   let Fi: Map<string, Fact> = FactImplicit;

//   let F = union(Fi, Fe);

//   do {
//     size = FiDel.size;
//     FiDel = add(FiDel, await Solver.evaluateRuleSet(
//       Logics.restrictRuleSet(R, union(FeDel, FiDel).values()),
//       union(F, FeDel).values(),
//     ));
//   } while (FiDel.size > size);

//   Fe = unionSE(Fe, FeDel); Fi = unionSE(Fi, FiDel); F = union(Fi, Fe);

//   do {
//     size = FiAdd.size;
//     FiAdd = add(
//       FiAdd,
//       await Solver.evaluateRuleSet(Logics.restrictRuleSet(R, FiDel.values()), F.values()),
//     );
//   } while (FiAdd.size > size);

//   F = unionSE(F, FeAdd);

//   do {
//     size = 0;
//     FiAdd = unionSE(F, FiAdd);
//     for (const rule of await Solver.evaluateRuleSet(Logics.restrictuleSet(R, F.values()), F.values())) {
//       const str = `${rule}`;
//       if (str in F) size = 1;
//     }
//   } while (size > 0);

//   return {
//     additions: { implicit: FiAdd, explicit: FeAdd },
//     deletions: { implicit: FiDel, explicit: FeDel },
//   };
// }
