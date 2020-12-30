import type { IActionSparqlParse, IActorSparqlParseOutput } from '@comunica/bus-sparql-parse';
import { ActorSparqlParse } from '@comunica/bus-sparql-parse';
import type { IActorArgs, IActorTest } from '@comunica/core';
/**
 * A comunica Algebra SPARQL Parse Actor.
 */
export declare class ActorSparqlParseAlgebra extends ActorSparqlParse {
    readonly prefixes: Record<string, string>;
    constructor(args: IActorSparqlParseAlgebraArgs);
    test(action: IActionSparqlParse): Promise<IActorTest>;
    run(action: IActionSparqlParse): Promise<IActorSparqlParseOutput>;
}
export interface IActorSparqlParseAlgebraArgs extends IActorArgs<IActionSparqlParse, IActorTest, IActorSparqlParseOutput> {
    /**
     * Default prefixes to use
     */
    prefixes?: Record<string, string>;
}
