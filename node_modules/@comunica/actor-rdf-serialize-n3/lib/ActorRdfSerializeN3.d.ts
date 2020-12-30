import type { IActionRdfSerialize, IActorRdfSerializeFixedMediaTypesArgs, IActorRdfSerializeOutput } from '@comunica/bus-rdf-serialize';
import { ActorRdfSerializeFixedMediaTypes } from '@comunica/bus-rdf-serialize';
import type { ActionContext } from '@comunica/core';
/**
 * A comunica N3 RDF Serialize Actor.
 */
export declare class ActorRdfSerializeN3 extends ActorRdfSerializeFixedMediaTypes {
    constructor(args: IActorRdfSerializeFixedMediaTypesArgs);
    runHandle(action: IActionRdfSerialize, mediaType: string, context: ActionContext): Promise<IActorRdfSerializeOutput>;
}
