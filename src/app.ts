import {Terminal} from 'xterm';
import {createCommandHelper, option, chalkInstance, Printer, locales, command} from 'typed-cli';
import {write, onRead, writeLn, onTab, prompt, setBuf} from './term-setup';
import {init} from './monaco-setup';
import { decorators } from 'typed-cli/src/decorator';
import { CommandSet, CommandHelperParams, prepareCommandSet } from 'typed-cli/src/command';
import chalk from 'chalk';
import {parseArgsStringToArgv} from 'string-argv';
import { completeForCommandSet } from 'typed-cli/src/completer';
import { alignTextMatrix } from 'typed-cli/src/utils';

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

const cli = function() {};
cli.commands = commandHelper;

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

function runHelper(newArgv: string[], evalCode: string) {
    argv = newArgv;
    try {
        exitCode = 0;
        ((cli, command, option, console) => {
            eval(evalCode);
        })(cli, command, option, mockConsole);
        writeLn('');
        writeLn(chalk.italic(`[exit code = ${chalk.blue(exitCode.toString())}]`));
    } catch(e) {
        writeLn('');
        writeLn(chalk.italic(`[exit code = ${chalk.blue(exitCode.toString())}]`));
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
    const cli = {
        commands: (cfg: any, arg: any) => cs = arg
    };
    ((cli, command, option, console) => {
        eval(evalCode);
    })(cli, command, option, mockConsole);
    cs = prepareCommandSet(cs);
    const completions = completeForCommandSet(cs, argv.slice(0, -1), argv[argv.length - 1] || '');

    applyCompletions(completions, argv, buf);
}

const programs = [
    {name: 'git', description: 'pseudo git'},
    {name: 'help', description: 'outputs help for this demo'},
];

function runProgramCompleter(buf: string) {
    const completions = programs
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

async function main() {
    const {getText, setText} = await init();

    setText(`cli.commands({
    program: 'git',
    description: 'Git is a free and open source distributed'
            + 'version control system designed to handle everything'
            + 'from small to very large projects with speed and efficiency.',
    completer: true,
}, {
    // reset
    reset: command({
        description: 'Reset current HEAD to the specified state',
        options: {
            hard: option('boolean').description('Resets the index and working tree'),
            soft: option('boolean').description('Does not touch the index file or the working tree at all'),
            mixed: option('boolean').description('Resets the index but not the working tree'),
        }
    })
        .handle(data => console.log('executing reset with params:', data)),

    // checkout
    checkout: command({
        description: 'Switch branches or restore working tree files',
        options: {
            b: option('boolean').description('causes a new branch to be created '),
        },
        _: option('string').required()
    })
        .handle(data => console.log('executing checkout with params:', data))
})

`);

    onRead(str => {
        const [program, ...argv] = parseArgsStringToArgv(str);
        if (program === 'git') {
            const jsCode = getText();
            writeLn('');
            runHelper(argv, jsCode);
        }
    });

    onTab(str => {
        const [program, ...argv] = parseArgsStringToArgv(str);
        if (/\s+$/.test(str)) {
            argv.push('');
        }
        if (argv.length === 0) {
            runProgramCompleter(program || '');
            return;
        }
        // console.log(argv);
        const completions = runCompleter(getText(), argv, str);

    })

}

main();

// write(cfg.generateHelp().replace(/\n/g, '\n\r'));
