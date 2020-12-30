import type { IActionRdfResolveQuadPattern, IActorRdfResolveQuadPatternOutput, IQuadSource } from '@comunica/bus-rdf-resolve-quad-pattern';
import { ActorRdfResolveQuadPatternSource } from '@comunica/bus-rdf-resolve-quad-pattern';
import type { ActionContext, IActorArgs, IActorTest } from '@comunica/core';
/**
 * A comunica RDFJS Source RDF Resolve Quad Pattern Actor.
 */
export declare class ActorRdfResolveQuadPatternRdfJsSource extends ActorRdfResolveQuadPatternSource {
    constructor(args: IActorArgs<IActionRdfResolveQuadPattern, IActorTest, IActorRdfResolveQuadPatternOutput>);
    test(action: IActionRdfResolveQuadPattern): Promise<IActorTest>;
    protected getSource(context: ActionContext): Promise<IQuadSource>;
}
