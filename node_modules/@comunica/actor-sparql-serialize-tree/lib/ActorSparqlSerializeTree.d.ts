import type { BindingsStream } from '@comunica/bus-query-operation';
import type { IActionSparqlSerialize, IActorSparqlSerializeFixedMediaTypesArgs, IActorSparqlSerializeOutput } from '@comunica/bus-sparql-serialize';
import { ActorSparqlSerializeFixedMediaTypes } from '@comunica/bus-sparql-serialize';
import type { ActionContext } from '@comunica/core';
import type { IConverterSettings } from 'sparqljson-to-tree';
/**
 * A comunica Tree SPARQL Serialize Actor.
 */
export declare class ActorSparqlSerializeTree extends ActorSparqlSerializeFixedMediaTypes implements IActorSparqlSerializeFixedMediaTypesArgs {
    constructor(args: IActorSparqlSerializeFixedMediaTypesArgs);
    /**
     *
     * @param {BindingsStream} bindingsStream
     * @param context
     * @param {IConverterSettings} converterSettings
     * @return {Promise<string>}
     */
    static bindingsStreamToGraphQl(bindingsStream: BindingsStream, context: ActionContext | Record<string, any> | undefined, converterSettings?: IConverterSettings): Promise<string>;
    testHandleChecked(action: IActionSparqlSerialize): Promise<boolean>;
    runHandle(action: IActionSparqlSerialize, mediaType: string): Promise<IActorSparqlSerializeOutput>;
}
