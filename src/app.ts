import {Terminal} from 'xterm';
import {createCommandHelper, option, chalkInstance, Printer, locales} from 'typed-cli';
import {write, onRead, writeLn} from './term-setup';
import {init} from './monaco-setup';
import { decorators } from 'typed-cli/src/decorator';
import { CommandSet, CommandHelperParams } from 'typed-cli/src/command';

let argv: string[] = [];

const commandHelper = createCommandHelper({
    argvProvider: () => argv,
    exiter: () => {},
    helpGeneration: true,
    printer: new Printer(locales.en_US, decorators.fancy),
    writer: (text, logType) => writeLn(text)
});

function runHelper(newArgv: string[], evalCode: string) {
    argv = newArgv;
    eval(evalCode);
}

// const cfg = configure({
//     command: 'curl',
//     description: `Pseudo curl, accepts a host, returns web content`,
//     options: {
//         port: option('int').alias('p').default(80).description('port to check'),
//         https: option('boolean').alias('s').description('cleans logs before start'),
//     },
//     _: option('string').required()
// }, {
//   decorator: 'fancy',
//   writer: str => writeLn(str)
// });

commandHelper

onRead(str => {
    if (str.startsWith('git ')) {
        writeLn('');
        // if (str.includes('--help')) {
        //     writeLn(cfg.generateHelp().replace(/\n/g, '\n\r'));
        //     return;
        // }
        // const rest = str.slice(5);
        // try {
        //     cfg.parse(rest);
        // } catch(e) {
        //     writeLn(e.message);
        // }

    }
});

init();

// write(cfg.generateHelp().replace(/\n/g, '\n\r'));
