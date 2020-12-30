import type { IActionHttp, IActorHttpOutput } from '@comunica/bus-http';
import type { Actor, IActionObserverArgs, IActorTest } from '@comunica/core';
import { ActionObserver } from '@comunica/core';
/**
 * Observes HTTP actions, and maintains a counter of the number of requests.
 */
export declare class ActionObserverHttp extends ActionObserver<IActionHttp, IActorHttpOutput> {
    requests: number;
    constructor(args: IActionObserverArgs<IActionHttp, IActorHttpOutput>);
    onRun(actor: Actor<IActionHttp, IActorTest, IActorHttpOutput>, action: IActionHttp, output: Promise<IActorHttpOutput>): void;
}
