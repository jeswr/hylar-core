import type { ActorInitSparql } from '@comunica/actor-init-sparql';
import type { IQueryEngine } from 'graphql-ld';
import type { Algebra } from 'sparqlalgebrajs';
/**
 * A comunica-based GraphQL-LD query engine.
 */
export declare class GraphQlQueryEngine implements IQueryEngine {
    private readonly comunicaEngine;
    constructor(comunicaEngine: ActorInitSparql);
    query(query: Algebra.Operation, options?: any): Promise<any>;
}
