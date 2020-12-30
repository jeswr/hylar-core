import type { IActionRdfMetadata, IActorRdfMetadataOutput } from '@comunica/bus-rdf-metadata';
import { ActorRdfMetadata } from '@comunica/bus-rdf-metadata';
import type { IActorArgs, IActorTest } from '@comunica/core';
/**
 * A comunica All RDF Metadata Actor.
 */
export declare class ActorRdfMetadataAll extends ActorRdfMetadata {
    constructor(args: IActorArgs<IActionRdfMetadata, IActorTest, IActorRdfMetadataOutput>);
    test(action: IActionRdfMetadata): Promise<IActorTest>;
    run(action: IActionRdfMetadata): Promise<IActorRdfMetadataOutput>;
}
