import type { IActionRdfSerialize, IActorRdfSerializeFixedMediaTypesArgs, IActorRdfSerializeOutput } from '@comunica/bus-rdf-serialize';
import { ActorRdfSerializeFixedMediaTypes } from '@comunica/bus-rdf-serialize';
import type { ActionContext } from '@comunica/core';
/**
 * A comunica Jsonld RDF Serialize Actor.
 */
export declare class ActorRdfSerializeJsonLd extends ActorRdfSerializeFixedMediaTypes {
    /**
     * The number of spaces that should be used to indent stringified JSON.
     */
    readonly jsonStringifyIndentSpaces: number;
    constructor(args: IActorRdfSerializeJsonLdArgs);
    runHandle(action: IActionRdfSerialize, mediaType: string, context: ActionContext): Promise<IActorRdfSerializeOutput>;
}
export interface IActorRdfSerializeJsonLdArgs extends IActorRdfSerializeFixedMediaTypesArgs {
    jsonStringifyIndentSpaces: number;
}
