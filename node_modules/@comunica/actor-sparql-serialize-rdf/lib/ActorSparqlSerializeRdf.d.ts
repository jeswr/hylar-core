import type { IActorArgsMediaTyped } from '@comunica/actor-abstract-mediatyped';
import type { IActorQueryOperationOutput } from '@comunica/bus-query-operation';
import type { IActionSparqlSerialize, IActionSparqlSerializeHandle, IActionSparqlSerializeMediaTypeFormats, IActionSparqlSerializeMediaTypes, IActorOutputSparqlSerializeHandle, IActorOutputSparqlSerializeMediaTypeFormats, IActorOutputSparqlSerializeMediaTypes, IActorSparqlSerializeOutput, IActorTestSparqlSerializeHandle, IActorTestSparqlSerializeMediaTypeFormats, IActorTestSparqlSerializeMediaTypes } from '@comunica/bus-sparql-serialize';
import { ActorSparqlSerialize } from '@comunica/bus-sparql-serialize';
import type { ActionContext, Actor, IActorTest, Mediator } from '@comunica/core';
/**
 * A comunica RDF SPARQL Serialize Actor.
 *
 * It serializes quad streams (for example resulting from a CONSTRUCT query)
 * to an RDF syntax.
 */
export declare class ActorSparqlSerializeRdf extends ActorSparqlSerialize implements IActorSparqlSerializeRdfArgs {
    readonly mediatorRdfSerialize: Mediator<Actor<IActionSparqlSerializeHandle, IActorTestSparqlSerializeHandle, IActorOutputSparqlSerializeHandle>, IActionSparqlSerializeHandle, IActorTestSparqlSerializeHandle, IActorOutputSparqlSerializeHandle>;
    readonly mediatorMediaTypeCombiner: Mediator<Actor<IActionSparqlSerializeMediaTypes, IActorTestSparqlSerializeMediaTypes, IActorOutputSparqlSerializeMediaTypes>, IActionSparqlSerializeMediaTypes, IActorTestSparqlSerializeMediaTypes, IActorOutputSparqlSerializeMediaTypes>;
    readonly mediatorMediaTypeFormatCombiner: Mediator<Actor<IActionSparqlSerializeMediaTypeFormats, IActorTestSparqlSerializeMediaTypeFormats, IActorOutputSparqlSerializeMediaTypeFormats>, IActionSparqlSerializeMediaTypeFormats, IActorTestSparqlSerializeMediaTypeFormats, IActorOutputSparqlSerializeMediaTypeFormats>;
    constructor(args: IActorSparqlSerializeRdfArgs);
    testHandle(action: IActorQueryOperationOutput, mediaType: string, context?: ActionContext): Promise<IActorTest>;
    runHandle(action: IActorQueryOperationOutput, mediaType: string, context?: ActionContext): Promise<IActorSparqlSerializeOutput>;
    testMediaType(context: ActionContext): Promise<boolean>;
    getMediaTypes(context?: ActionContext): Promise<Record<string, number>>;
    testMediaTypeFormats(context: ActionContext): Promise<boolean>;
    getMediaTypeFormats(context?: ActionContext): Promise<Record<string, string>>;
}
export interface IActorSparqlSerializeRdfArgs extends IActorArgsMediaTyped<IActionSparqlSerialize, IActorTest, IActorSparqlSerializeOutput> {
    mediatorRdfSerialize: Mediator<Actor<IActionSparqlSerializeHandle, IActorTestSparqlSerializeHandle, IActorOutputSparqlSerializeHandle>, IActionSparqlSerializeHandle, IActorTestSparqlSerializeHandle, IActorOutputSparqlSerializeHandle>;
    mediatorMediaTypeCombiner: Mediator<Actor<IActionSparqlSerializeMediaTypes, IActorTestSparqlSerializeMediaTypes, IActorOutputSparqlSerializeMediaTypes>, IActionSparqlSerializeMediaTypes, IActorTestSparqlSerializeMediaTypes, IActorOutputSparqlSerializeMediaTypes>;
    mediatorMediaTypeFormatCombiner: Mediator<Actor<IActionSparqlSerializeMediaTypeFormats, IActorTestSparqlSerializeMediaTypeFormats, IActorOutputSparqlSerializeMediaTypeFormats>, IActionSparqlSerializeMediaTypeFormats, IActorTestSparqlSerializeMediaTypeFormats, IActorOutputSparqlSerializeMediaTypeFormats>;
}
