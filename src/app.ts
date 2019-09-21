import {Terminal} from 'xterm';
import {createCommandHelper, option, chalkInstance, Printer, locales, command, defaultCommand} from 'typed-cli';
import {write, onRead, writeLn, onTab, prompt, setBuf} from './term-setup';
import {init} from './monaco-setup';
import { decorators } from 'typed-cli/src/decorator';
import { CommandSet, CommandHelperParams, prepareCommandSet } from 'typed-cli/src/command';
import chalk from 'chalk';
import {parseArgsStringToArgv} from 'string-argv';
import { completeForCommandSet, completeForCliDecl } from 'typed-cli/src/completer';
import { alignTextMatrix } from 'typed-cli/src/utils';
import { createCliHelper } from 'typed-cli/src/cli-helper';
import { prepareCliDeclaration } from 'typed-cli/src/parser';
import * as presets from 'typed-cli/presets';
import * as samples from './samples-generated';
import {transform} from 'sucrase';

(window as any)._loader.onItemLoad(10);

chalk.level = 16;
chalk.enabled = true;

let argv: string[] = [];
let exitCode = 0;

const commandHelper = createCommandHelper({
    argvProvider: () => argv,
    exiter: (hasErrors) => exitCode = (hasErrors ? 1 : 0),
    helpGeneration: true,
    printer: new Printer({locale: locales.en_US, decorator: decorators.fancy, lineEnding: '\n\r'}),
    writer: (text, logType) => writeLn(text)
});

const cliHelper = createCliHelper({
    argvProvider: () => argv,
    exiter: (hasErrors) => exitCode = (hasErrors ? 1 : 0),
    helpGeneration: true,
    printer: new Printer({locale: locales.en_US, decorator: decorators.fancy, lineEnding: '\n\r'}),
    writer: (text, logType) => writeLn(text)
});

const stringifyParams = (args: any) => {
    return args.map((i: any) => {
        switch (typeof i) {
            case 'number':
                return chalk.blue(i.toString());
            case 'string':
                return i;
            case 'function':
                return chalk.green((i as Function).toString());
            case 'boolean':
            case 'undefined':
                return chalk.magenta(i as any);
            case 'object':
                return JSON.stringify(i, null, 4);
            default:
                return String(i);
        }
    }).join(' ').replace(/\n/g, '\n\r');
}
const mockConsole = {
    log: (...args: any[]) => {
        writeLn(stringifyParams(args));
        console.log(...args);
    },
    error: (...args: any[]) => {
        writeLn(chalk.red(stringifyParams(args)));
        console.error(...args);
    },
    warn: (...args: any[]) => {
        writeLn(chalk.yellow(stringifyParams(args)));
        console.warn(...args);
    }
}

function mockRequire(cli: any) {
    return (str: string) => {
        if (str === 'typed-cli') {
            return {cli, command, option, defaultCommand, presets};
        }
        if (str === 'chalk') {
            return chalk;
        }
        throw new Error(`only 'typed-cli' can be required in this demo`);
    }
}

function runHelper(newArgv: string[], evalCode: string) {
    argv = newArgv;
    exitCode = 0;
    const cli = function(...args: any) {
        return (cliHelper as any)(...args);
    };
    (cli as any).commands = commandHelper;
    try {
        const fn = new Function('require', 'console', evalCode);
        fn(mockRequire(cli), mockConsole)
        if (exitCode !== 0) {
            writeLn('');
            writeLn(chalk.italic(`[exit code = ${chalk.blue(exitCode.toString())}]`));
        }
    } catch(e) {
        if (exitCode !== 0) {
            writeLn('');
            writeLn(chalk.italic(`[exit code = ${chalk.blue(exitCode.toString())}]`));
        }
        if (e.message === 'exiter has failed') {
            return;
        }
        console.error(e);
        writeLn(chalk.red(''));
        writeLn(chalk.red('Error occured (see browser console also)'));
        writeLn(e.stack.replace(/\n/g, '\n\r'));
    }
}

function runCompleter(evalCode: string, argv: string[], buf: string) {
    let cs: any;
    let decl: any;
    function cli(_: any) {
        decl = _;
        throw 0;
    }
    cli.commands = (cfg: any, arg: any) => {
        cs = arg;
    };
    try {
        const fn = new Function('require', 'console', evalCode);
        fn(mockRequire(cli), mockConsole)
    } catch(e) {
        // console.error(e);
        // return;
    }
    let completions: any[] = [];
    if (decl) {
        decl = prepareCliDeclaration(decl).decl;
        completions = completeForCliDecl(decl, argv.slice(0, -1), argv[argv.length - 1] || '');
    } else {
        cs = prepareCommandSet(cs);
        completions = completeForCommandSet(cs, argv.slice(0, -1), argv[argv.length - 1] || '');
    }

    applyCompletions(completions, argv, buf);
}

const programCompletions = Object.values(samples);

function runProgramCompleter(buf: string) {
    const completions = programCompletions
        .filter(({name}) => name.indexOf(buf) === 0)
        .map(({name, description}) => ({description, completion: name}));
    applyCompletions(completions, [buf], buf);
}

function applyCompletions(completions: {completion: string, description: string}[], argv: string[], buf: string) {
    if (completions.length === 0) {
        return;
    }
    const last = argv[argv.length - 1] || '';
    writeLn('');
    const completionMatrix = completions.map(c => [c.completion, c.description]);
    const completionText = alignTextMatrix(completionMatrix, ['right', 'left'])
        .map(([c, d]) => `${c} ${chalk.dim('| ' + d)}`)
        .join('\n\r');
    writeLn(completionText);
    let commonPart = '';
    let i = last.length;
    const firstCompletion = completions[0].completion;
    while (true) {
        if (completions.every(c => c.completion[i] && c.completion[i] === firstCompletion[i])) {
            i++;
        } else {
            break;
        }
    }
    prompt();
    buf += firstCompletion.slice(last.length, i);
    setBuf(buf);
    write(buf);
}

function resolveProgram(program: string): null | string {
    const sample = samples[program as keyof typeof samples];
    if (!sample) {
        return null;
    }
    const code = localStorage.getItem(`sample-code[${program}]`) || sample.code;
    const js = transform(code, {transforms: ["typescript", "imports"]});
    return js.code;
}

async function main() {
    const {getText, setText} = await init();

    const runShellStr = (str: string) => {
        if (str === '') {
            return;
        }
        const [program, ...argv] = parseArgsStringToArgv(str);
        const jsCode = resolveProgram(program);
        if (!jsCode) {
            writeLn('');
            writeLn(`program ${chalk.redBright(program)} is not found`);
            return;
        }
        writeLn('');
        runHelper(argv, jsCode);
    };

    onRead(runShellStr);

    onTab(str => {
        const [program, ...argv] = parseArgsStringToArgv(str);
        if (/\s+$/.test(str)) {
            argv.push('');
        }
        if (argv.length === 0) {
            runProgramCompleter(program || '');
            return;
        }
        const code = resolveProgram(program);
        if (!code) {
            return;
        }
        runCompleter(code, argv, str);
    });

    runShellStr('help');
    prompt();

    (window as any)._loader.onItemLoad(10);
    setTimeout(() => {
        (window as any)._loader.onLoad();
    }, 100);
}

main();

// write(cfg.generateHelp().replace(/\n/g, '\n\r'));
