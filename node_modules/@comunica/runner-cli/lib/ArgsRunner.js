"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runArgsInProcessStatic = exports.runArgsInProcess = exports.runArgs = void 0;
const runner_1 = require("@comunica/runner");
function runArgs(configResourceUrl, argv, stdin, stdout, stderr, env, runnerUri, properties) {
    runner_1.run(configResourceUrl, { argv, env, stdin }, runnerUri, properties)
        .then((results) => {
        results.forEach((result) => {
            if (result.stdout) {
                result.stdout.on('error', error => process.stderr.write(`${error.message}\n`));
                result.stdout.pipe(stdout);
            }
            if (result.stderr) {
                result.stderr.on('error', error => process.stderr.write(`${error.message}\n`));
                result.stderr.pipe(stderr);
            }
        });
    })
        .catch(error => process.stderr.write(`${error.message}\n`));
}
exports.runArgs = runArgs;
function runArgsInProcess(moduleRootPath, defaultConfigPath) {
    const argv = process.argv.slice(2);
    runArgs(process.env.COMUNICA_CONFIG ?
        `${process.cwd()}/${process.env.COMUNICA_CONFIG}` :
        defaultConfigPath, argv, process.stdin, process.stdout, process.stderr, process.env, undefined, {
        mainModulePath: moduleRootPath,
    });
}
exports.runArgsInProcess = runArgsInProcess;
function runArgsInProcessStatic(actor) {
    const argv = process.argv.slice(2);
    actor.run({ argv, env: process.env, stdin: process.stdin })
        .then((result) => {
        if (result.stdout) {
            result.stdout.on('error', error => process.stderr.write(`${error.message}\n`));
            result.stdout.pipe(process.stdout);
        }
        if (result.stderr) {
            result.stderr.on('error', error => process.stderr.write(`${error.message}\n`));
            result.stderr.pipe(process.stderr);
        }
    }).catch((error) => process.stderr.write(`${error.message}\n`));
}
exports.runArgsInProcessStatic = runArgsInProcessStatic;
//# sourceMappingURL=ArgsRunner.js.map