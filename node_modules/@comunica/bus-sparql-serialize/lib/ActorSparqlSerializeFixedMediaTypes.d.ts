import type { IActorArgsMediaTypedFixed } from '@comunica/actor-abstract-mediatyped';
import { ActorAbstractMediaTypedFixed } from '@comunica/actor-abstract-mediatyped';
import type { ActionContext, IActorTest } from '@comunica/core';
import type { IActionSparqlSerialize, IActorSparqlSerializeOutput } from './ActorSparqlSerialize';
/**
 * A base actor for listening to SPARQL serialize events that has fixed media types.
 *
 * Actor types:
 * * Input:  IActionSparqlSerializeOrMediaType:      A serialize input or a media type input.
 * * Test:   <none>
 * * Output: IActorSparqlSerializeOutputOrMediaType: The serialized quads.
 *
 * @see IActionInit
 */
export declare abstract class ActorSparqlSerializeFixedMediaTypes extends ActorAbstractMediaTypedFixed<IActionSparqlSerialize, IActorTest, IActorSparqlSerializeOutput> implements IActorSparqlSerializeFixedMediaTypesArgs {
    constructor(args: IActorSparqlSerializeFixedMediaTypesArgs);
    testHandleChecked(action: IActionSparqlSerialize, context: ActionContext): Promise<boolean>;
}
export interface IActorSparqlSerializeFixedMediaTypesArgs extends IActorArgsMediaTypedFixed<IActionSparqlSerialize, IActorTest, IActorSparqlSerializeOutput> {
}
