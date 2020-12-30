/**
 * Created by Spadon on 11/09/2015.
 */
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
export declare function naive(FeAdd: any, FeDel: any, F: any, R: any): Promise<{
    additions: any[];
    deletions: any[];
    updatedF: any;
}>;
/**
 * Incremental reasoning which avoids complete recalculation of facts.
 * Concat is preferred over merge for evaluation purposes.
 * @param R set of rules
 * @param F set of assertions
 * @param FeAdd set of assertions to be added
 * @param FeDel set of assertions to be deleted
 */
export declare function incremental(FeAdd: any, FeDel?: any, F?: any, R?: any): Promise<{
    additions: any;
    deletions: any;
}>;
/**
 * Returns valid facts using explicit facts' validity tags.
 * @param F
 * @param refs
 * @returns {Array}
 */
export declare function tagFilter(F: any): any;
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
export declare function tagging(FeAdd: any, FeDel: any, F: any, R: any): Promise<unknown>;
