/// <reference types="node" />
import type { IActionHttp, IActorHttpOutput } from '@comunica/bus-http';
import { Bindings } from '@comunica/bus-query-operation';
import type { ActionContext, Actor, IActorTest, Mediator } from '@comunica/core';
import { BufferedIterator } from 'asynciterator';
/**
 * An AsyncIterator that executes a SPARQL query against an endpoint, parses each binding, and emits it in this stream.
 */
export declare class AsyncIteratorJsonBindings extends BufferedIterator<Bindings> {
    private readonly endpoint;
    private readonly query;
    private readonly context?;
    private readonly mediatorHttp;
    private initialized;
    constructor(endpoint: string, query: string, context: ActionContext | undefined, mediatorHttp: Mediator<Actor<IActionHttp, IActorTest, IActorHttpOutput>, IActionHttp, IActorTest, IActorHttpOutput>);
    protected _read(count: number, done: () => void): void;
    protected fetchBindingsStream(endpoint: string, query: string, context?: ActionContext): Promise<NodeJS.ReadableStream>;
}
