import { Logger } from '@comunica/core';
/**
 * A logger that voids everything.
 */
export declare class LoggerVoid extends Logger {
    debug(): void;
    error(): void;
    fatal(): void;
    info(): void;
    trace(): void;
    warn(): void;
}
