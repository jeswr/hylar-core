import type { IActionHttp, IActorHttpOutput } from '@comunica/bus-http';
import { ActorHttp } from '@comunica/bus-http';
import type { IActorArgs, IActorTest, Mediator } from '@comunica/core';
import type { IMediatorTypeTime } from '@comunica/mediatortype-time';
/**
 * A comunica Proxy Http Actor.
 */
export declare class ActorHttpProxy extends ActorHttp {
    readonly mediatorHttp: Mediator<ActorHttp, IActionHttp, IActorTest, IActorHttpOutput>;
    constructor(args: IActorHttpProxyArgs);
    test(action: IActionHttp): Promise<IMediatorTypeTime>;
    run(action: IActionHttp): Promise<IActorHttpOutput>;
}
export interface IActorHttpProxyArgs extends IActorArgs<IActionHttp, IActorTest, IActorHttpOutput> {
    mediatorHttp: Mediator<ActorHttp, IActionHttp, IActorTest, IActorHttpOutput>;
}
export declare const KEY_CONTEXT_HTTPPROXYHANDLER = "@comunica/actor-http-proxy:httpProxyHandler";
