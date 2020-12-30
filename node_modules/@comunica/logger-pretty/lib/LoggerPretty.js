"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerPretty = void 0;
const util_1 = require("util");
const core_1 = require("@comunica/core");
/**
 * A logger that pretty-prints everything.
 */
class LoggerPretty extends core_1.Logger {
    constructor(args) {
        super();
        this.level = args.level;
        this.levelOrdinal = core_1.Logger.getLevelOrdinal(this.level);
        this.actors = args.actors || {};
    }
    debug(message, data) {
        this.log('debug', message, data);
    }
    error(message, data) {
        this.log('error', message, data);
    }
    fatal(message, data) {
        this.log('fatal', message, data);
    }
    info(message, data) {
        this.log('info', message, data);
    }
    trace(message, data) {
        this.log('trace', message, data);
    }
    warn(message, data) {
        this.log('warn', message, data);
    }
    log(level, message, data) {
        if (core_1.Logger.getLevelOrdinal(level) >= this.levelOrdinal &&
            (!data || !('actor' in data) || this.actors[data.actor])) {
            process.stderr.write(`[${new Date().toISOString()}]  ${level.toUpperCase()}: ${message} ${util_1.inspect(data)}\n`);
        }
    }
}
exports.LoggerPretty = LoggerPretty;
//# sourceMappingURL=LoggerPretty.js.map