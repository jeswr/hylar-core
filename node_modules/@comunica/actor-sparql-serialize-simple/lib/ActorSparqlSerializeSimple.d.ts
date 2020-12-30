import type { IActionSparqlSerialize, IActorSparqlSerializeFixedMediaTypesArgs, IActorSparqlSerializeOutput } from '@comunica/bus-sparql-serialize';
import { ActorSparqlSerializeFixedMediaTypes } from '@comunica/bus-sparql-serialize';
import type { ActionContext } from '@comunica/core';
/**
 * A comunica Simple Sparql Serialize Actor.
 */
export declare class ActorSparqlSerializeSimple extends ActorSparqlSerializeFixedMediaTypes {
    constructor(args: IActorSparqlSerializeFixedMediaTypesArgs);
    testHandleChecked(action: IActionSparqlSerialize, context: ActionContext): Promise<boolean>;
    runHandle(action: IActionSparqlSerialize, mediaType: string, context: ActionContext): Promise<IActorSparqlSerializeOutput>;
}
