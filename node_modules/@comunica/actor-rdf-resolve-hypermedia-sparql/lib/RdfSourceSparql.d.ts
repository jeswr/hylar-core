import type { IActionHttp, IActorHttpOutput } from '@comunica/bus-http';
import type { BindingsStream } from '@comunica/bus-query-operation';
import type { IQuadSource } from '@comunica/bus-rdf-resolve-quad-pattern';
import type { ActionContext, Actor, IActorTest, Mediator } from '@comunica/core';
import type { AsyncIterator } from 'asynciterator';
import type * as RDF from 'rdf-js';
import { Factory } from 'sparqlalgebrajs';
export declare class RdfSourceSparql implements IQuadSource {
    protected static readonly FACTORY: Factory;
    private readonly url;
    private readonly context;
    private readonly mediatorHttp;
    constructor(url: string, context: ActionContext | undefined, mediatorHttp: Mediator<Actor<IActionHttp, IActorTest, IActorHttpOutput>, IActionHttp, IActorTest, IActorHttpOutput>);
    /**
     * Send a SPARQL query to a SPARQL endpoint and retrieve its bindings as a stream.
     * @param {string} endpoint A SPARQL endpoint URL.
     * @param {string} query A SPARQL query string.
     * @param {ActionContext} context An optional context.
     * @return {BindingsStream} A stream of bindings.
     */
    queryBindings(endpoint: string, query: string, context?: ActionContext): BindingsStream;
    match(subject: RDF.Term, predicate: RDF.Term, object: RDF.Term, graph: RDF.Term): AsyncIterator<RDF.Quad>;
}
