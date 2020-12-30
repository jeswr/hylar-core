import type { IActionHttp, IActorHttpOutput } from '@comunica/bus-http';
import type { IActionRdfDereference, IActorRdfDereferenceMediaMappingsArgs, IActorRdfDereferenceOutput } from '@comunica/bus-rdf-dereference';
import { ActorRdfDereferenceMediaMappings } from '@comunica/bus-rdf-dereference';
import type { IActionHandleRdfParse, IActionMediaTypesRdfParse, IActorOutputHandleRdfParse, IActorOutputMediaTypesRdfParse, IActorTestHandleRdfParse, IActorTestMediaTypesRdfParse } from '@comunica/bus-rdf-parse';
import type { Actor, IActorTest, Mediator } from '@comunica/core';
/**
 * An actor that listens on the 'rdf-dereference' bus.
 *
 * It starts by grabbing all available RDF media types from the RDF parse bus.
 * After that, it resolves the URL using the HTTP bus using an accept header compiled from the available media types.
 * Finally, the response is parsed using the RDF parse bus.
 */
export declare abstract class ActorRdfDereferenceHttpParseBase extends ActorRdfDereferenceMediaMappings implements IActorRdfDereferenceHttpParseArgs {
    static readonly REGEX_MEDIATYPE: RegExp;
    readonly mediatorHttp: Mediator<Actor<IActionHttp, IActorTest, IActorHttpOutput>, IActionHttp, IActorTest, IActorHttpOutput>;
    readonly mediatorRdfParseMediatypes: Mediator<Actor<IActionMediaTypesRdfParse, IActorTestMediaTypesRdfParse, IActorOutputMediaTypesRdfParse>, IActionMediaTypesRdfParse, IActorTestMediaTypesRdfParse, IActorOutputMediaTypesRdfParse>;
    readonly mediatorRdfParseHandle: Mediator<Actor<IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>, IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>;
    readonly maxAcceptHeaderLength: number;
    readonly maxAcceptHeaderLengthBrowser: number;
    constructor(args: IActorRdfDereferenceHttpParseArgs);
    test(action: IActionRdfDereference): Promise<IActorTest>;
    run(action: IActionRdfDereference): Promise<IActorRdfDereferenceOutput>;
    mediaTypesToAcceptString(mediaTypes: Record<string, number>, maxLength: number): string;
    protected abstract getMaxAcceptHeaderLength(): number;
}
export interface IActorRdfDereferenceHttpParseArgs extends IActorRdfDereferenceMediaMappingsArgs {
    mediatorHttp: Mediator<Actor<IActionHttp, IActorTest, IActorHttpOutput>, IActionHttp, IActorTest, IActorHttpOutput>;
    mediatorRdfParseMediatypes: Mediator<Actor<IActionMediaTypesRdfParse, IActorTestMediaTypesRdfParse, IActorOutputMediaTypesRdfParse>, IActionMediaTypesRdfParse, IActorTestMediaTypesRdfParse, IActorOutputMediaTypesRdfParse>;
    mediatorRdfParseHandle: Mediator<Actor<IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>, IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>;
    maxAcceptHeaderLength: number;
    maxAcceptHeaderLengthBrowser: number;
}
