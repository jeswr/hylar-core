import type { IActorRdfDereferenceHttpParseArgs } from './ActorRdfDereferenceHttpParseBase';
import { ActorRdfDereferenceHttpParseBase } from './ActorRdfDereferenceHttpParseBase';
/**
 * The browser variant of {@link ActorRdfDereferenceHttpParse}.
 */
export declare class ActorRdfDereferenceHttpParse extends ActorRdfDereferenceHttpParseBase {
    constructor(args: IActorRdfDereferenceHttpParseArgs);
    protected getMaxAcceptHeaderLength(): number;
}
