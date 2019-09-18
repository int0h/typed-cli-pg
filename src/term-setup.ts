import {Terminal} from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import {chalkInstance} from 'typed-cli';
import * as ansiEscapes from 'ansi-escapes';
import {HistoryMgr} from './historyMgr';

Terminal.applyAddon(fit);

chalkInstance.enabled = true;
chalkInstance.level = 16;

const w: any = window;

const themes = {
    broadcast: ["#000000", "#da4939", "#519f50", "#ffd24a", "#6d9cbe", "#d0d0ff", "#6e9cbe", "#ffffff", "#323232", "#ff7b6b", "#83d182", "#ffff7c", "#9fcef0", "#ffffff", "#a0cef0", "#ffffff", "#2b2b2b", "#e6e1dc"],
    nordLight: ["#353535", "#E64569", "#89D287", "#DAB752", "#439ECF", "#D961DC", "#64AAAF", "#B3B3B3", "#535353", "#E4859A", "#A2CCA1", "#E1E387", "#6FBBE2", "#E586E7", "#96DCDA", "#DEDEDE", "#ebeaf2", "#004f7c"],
    obsidian: ["#000000", "#a60001", "#00bb00", "#fecd22", "#3a9bdb", "#bb00bb", "#00bbbb", "#bbbbbb", "#555555", "#ff0003", "#93c863", "#fef874", "#a1d7ff", "#ff55ff", "#55ffff", "#ffffff", "#283033", "#cdcdcd"],
    novel: ["#000000", "#cc0000", "#009600", "#d06b00", "#0000cc", "#cc00cc", "#0087cc", "#cccccc", "#808080", "#cc0000", "#009600", "#d06b00", "#0000cc", "#cc00cc", "#0087cc", "#ffffff", "#dfdbc3", "#3b2322"]
};

const themeSelector = document.querySelector('#term-theme') as HTMLSelectElement;
for (const [name] of Object.entries(themes)) {
    const o = document.createElement('option');
    o.innerText = `Theme: ${name}`;
    o.value = name;
    themeSelector.appendChild(o);
}
themeSelector.onchange = () => {
    applyTheme(themes[themeSelector.value as keyof typeof themes]);
}

const applyTheme = (theme: string[]) => {
    const [
        black, red, green, yellow, blue, magneta, cyan, white,
        brightBlack, brightRed, brightGreen, brightYellow, brightBlue, brightMagneta, brightCyan, brightWhite,
        background, foreground
    ] = theme;
    term.setOption('theme', {
        black, red, green, yellow, blue, magneta, cyan, white,
        brightBlack, brightRed, brightGreen, brightYellow, brightBlue, brightMagneta, brightCyan, brightWhite,
        background, foreground, cursor: foreground, cursorAccent: background
    });
 }

const term = new Terminal({
    cursorBlink: true
});
term.focus();
w.term = term;
term.open(document.getElementById('terminal') as HTMLElement);
fit.fit(term);

applyTheme(themes.novel);
// term.setOption('fontFamily', 'Source Code Pro');
term.setOption('fontFamily', 'monospace');
term.setOption('allowTransparency', true);
// term.setOption('theme', { background: '#0f3642' });

var shellprompt = `${chalkInstance.green('user@pc')}:${chalkInstance.blue('~/work')}$ `;
const promptsize = 16;

export const prompt = function () {
    term.write('\r\n' + shellprompt);
};

const getCursorX = () => {
    return (term as any)._core.buffer.x;
}

term.writeln('This is a pseudo terminal');
term.writeln('Supported shortcuts: Ctrl+C (reject input), Ctrl+K (clear terminal), Shift+Insert (paste)');
term.writeln('Type some keys and commands to play around.');
term.writeln('');
prompt();

let reader = (str: string) => {console.log(str)};
let tabHandler = (str: string) => {console.log('tab')};

let buf = '';

const historyMgr = new HistoryMgr();
// window.h = historyMgr;

function replaceText(text: string) {
    buf = text;
    term.write(ansiEscapes.eraseLine);
    term.write('\r');
    term.write(shellprompt);
    term.write(text);
}

term.on('key', function (key, ev) {
    // console.log(key);
    var printable = (
        !ev.altKey && !ev.ctrlKey && !ev.metaKey
    );

    if (key === '\t') {
        tabHandler(buf);
        return;
    }

    if (key === '\u0003') {
        buf = '';
        prompt();
        return;
    }

    if (key === '\u000b') {
        buf = '';
        term.clear();
        return;
    }

    if (ev.keyCode == 13) {
        const t = buf;
        buf = '';
        reader(t);
        if (t.trim() !== '') {
            historyMgr.push(t);
            // saveToHistory(t, historyPos);
            // historyPos = history.length + 1;
        }
        // history.push(t);
        prompt();
    } else if (ev.keyCode == 8) {
        if (getCursorX() > promptsize) {
            buf = buf.slice(0, -1);
            term.write('\b \b');
        }
    } else if (printable) {
        if (key.length === 1) {
            buf += key;
            // console.log(buf);
        }
        if (ev.code === 'ArrowUp') {
            replaceText(historyMgr.goUp(buf));
        }
        if (ev.code === 'ArrowDown') {
            replaceText(historyMgr.goDown(buf));
        }
        if (ev.code !== 'ArrowUp' && ev.code !== 'ArrowDown') {
            term.write(key);
        }
    }
});

term.on('paste', function (data, ev) {
    term.write(data);
});

export function writeLn(text: string) {
    term.writeln(text);
}

export function write(text: string) {
    term.write(text);
}

export function onRead(fn: (str: string) => void) {
    reader = fn;
}

export function onTab(fn: (str: string) => void) {
    tabHandler = fn;
}

export function setBuf(str: string) {
    buf = str;
}

export function getCursorPos(): Promise<{x: number, y: number}> {
    return new Promise((resolve, reject) => {
        const listener = term.onData(data => {
            const matched = /^\u001b\[(\d+);(\d+)R$/.exec(data);
            if (!matched) {
                return;
            }
            const [y, x] = matched.slice(1).map(i => Number(i) - 1);
            resolve({x, y});
            listener.dispose();
        });

        term.write(ansiEscapes.cursorGetPosition);
    });
}
