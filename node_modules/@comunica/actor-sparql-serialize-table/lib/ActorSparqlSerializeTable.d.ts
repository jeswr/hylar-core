/// <reference types="node" />
import { Readable } from 'stream';
import type { Bindings } from '@comunica/bus-query-operation';
import type { IActionSparqlSerialize, IActorSparqlSerializeFixedMediaTypesArgs, IActorSparqlSerializeOutput } from '@comunica/bus-sparql-serialize';
import { ActorSparqlSerializeFixedMediaTypes } from '@comunica/bus-sparql-serialize';
import type { ActionContext } from '@comunica/core';
/**
 * A comunica Table Sparql Serialize Actor.
 */
export declare class ActorSparqlSerializeTable extends ActorSparqlSerializeFixedMediaTypes implements IActorSparqlSerializeTableArgs {
    readonly columnWidth: number;
    readonly padding: string;
    constructor(args: IActorSparqlSerializeTableArgs);
    static repeat(str: string, count: number): string;
    testHandleChecked(action: IActionSparqlSerialize, context: ActionContext): Promise<boolean>;
    pad(str: string): string;
    pushHeader(data: Readable, labels: string[]): void;
    pushRow(data: Readable, labels: string[], bindings: Bindings): void;
    runHandle(action: IActionSparqlSerialize, mediaType: string, context: ActionContext): Promise<IActorSparqlSerializeOutput>;
}
export interface IActorSparqlSerializeTableArgs extends IActorSparqlSerializeFixedMediaTypesArgs {
    columnWidth: number;
}
