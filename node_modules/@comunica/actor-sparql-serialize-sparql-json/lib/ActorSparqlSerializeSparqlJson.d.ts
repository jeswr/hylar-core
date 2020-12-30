import type { IActionSparqlSerialize, IActorSparqlSerializeFixedMediaTypesArgs, IActorSparqlSerializeOutput } from '@comunica/bus-sparql-serialize';
import { ActorSparqlSerializeFixedMediaTypes } from '@comunica/bus-sparql-serialize';
import type { ActionContext } from '@comunica/core';
import type * as RDF from 'rdf-js';
/**
 * A comunica sparql-results+xml Serialize Actor.
 */
export declare class ActorSparqlSerializeSparqlJson extends ActorSparqlSerializeFixedMediaTypes {
    constructor(args: IActorSparqlSerializeFixedMediaTypesArgs);
    /**
     * Converts an RDF term to its JSON representation.
     * @param {RDF.Term} value An RDF term.
     * @return {any} A JSON object.
     */
    static bindingToJsonBindings(value: RDF.Term): any;
    testHandleChecked(action: IActionSparqlSerialize, context: ActionContext): Promise<boolean>;
    runHandle(action: IActionSparqlSerialize, mediaType?: string, context?: ActionContext): Promise<IActorSparqlSerializeOutput>;
}
