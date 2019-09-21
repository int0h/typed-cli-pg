// const parseTmTheme = require('monaco-themes').parseTmTheme;
import * as themes from './monaco-themes/';
import {files} from './lib-generated';
import * as samples from './samples-generated';

function waitForCallback(): Promise<typeof import('monaco-editor')> {
    const w: any = window;
    return new Promise(resolve => {
        if (w.monaco) {
            resolve(w.monaco);
        }
        w.monacoLoaded = (m: any) => {
            resolve(m)
        }
    });
}

const note = document.querySelector('#notification') as HTMLElement;
let timerId: any;
function notify(str: string) {
    note.textContent = str;
    note.style.opacity = '0.9';
    clearTimeout(timerId);
    timerId = setTimeout(() => {
        note.style.opacity = '0';
    }, 2000);
}

function ctrlSNotify() {
    if (sessionStorage.getItem('ctrl-s-note-shown')) {
        notify(`Old habits die hard, right ;)`);
    } else {
        notify(`The code is saved automatically, you don't have to do it by hand`);
        sessionStorage.setItem('ctrl-s-note-shown', 'true');
    }
}

export async function init() {
    const monaco = await waitForCallback();

    const themeSelector = document.querySelector('#code-theme') as HTMLSelectElement;
    for (const [name, theme] of Object.entries(themes)) {
        const o = document.createElement('option');
        o.innerText = `Theme: ${name}`;
        o.value = name;
        themeSelector.appendChild(o);
        monaco.editor.defineTheme(name, theme as any);

    }
    themeSelector.onchange = () => {
        monaco.editor.setTheme(themeSelector.value);
        localStorage.setItem('code-theme', themeSelector.value);
    }
    const savedTheme = localStorage.getItem('code-theme') || 'monokai';
    themeSelector.value = savedTheme;
    monaco.editor.setTheme(savedTheme);

    const sampleSelector = document.querySelector('#sample-select') as HTMLSelectElement;
    for (const [name, theme] of Object.entries(samples)) {
        const o = document.createElement('option');
        o.innerText = `Sample: ${name}`;
        o.value = name;
        o.selected = name === 'basic';
        sampleSelector.appendChild(o);
    }
    sampleSelector.onchange = () => {
        const code = localStorage.getItem(`sample-code[${sampleSelector.value}]`) || (samples as any)[sampleSelector.value].code;
        model.setValue(code);
        localStorage.setItem('code-sample', sampleSelector.value);
        updateTitle();
    }

    (document.querySelector('#discard') as HTMLElement).onclick = () => {
        const sampleName = sampleSelector.value;
        if (confirm(`Are you sure you want to discard changes in "${sampleName}" sample?`)) {
            const code = (samples as any)[sampleName].code;
            model.setValue(code);
        }
    };

    const encodeCode = (str: string): string => {
        return btoa(encodeURIComponent(str));
    }

    const decodeCode = (str: string): string => {
        return decodeURIComponent(atob(str));
    }

    const copyToClipboard = (str: string) => {
        try {
            const cp = document.querySelector('#clipboard') as HTMLInputElement;
            cp.value = str;
            cp.select();
            document.execCommand('copy');
            notify('The link is coppied to clipboard');
        } catch(e) {
            alert('Failed to copy to clipboard: ' + e.message);
        }
    }

    function share() {
        const encoded = encodeCode(model.getValue());
        const link = window.location.toString().replace(/#.*$/, '') + `#share-${encoded}`;
        copyToClipboard(link);
    }

    (document.querySelector('#share') as HTMLElement).onclick = () => {
        share();
    };

    (document.querySelector('.win-code') as HTMLElement).onkeydown = (e) => {
        if (e.code === 'KeyS' && e.ctrlKey) {
            e.preventDefault();
            share();
        }
    }

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2015,
        allowNonTsExtensions: true
    });

    files.forEach(({content, filename}) => {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(content, 'file:///' + filename);
    });

    const model = monaco.editor.createModel(
        `import {cli} from 'typed-cli';\n`,
        'typescript',
        monaco.Uri.parse('file:///main.ts')
    );

    monaco.editor.create(document.getElementById("code") as HTMLElement, {
        language: "javascript",
        model: model
    });

    function updateTitle() {
        const elm = document.querySelector('.win-code .win-header') as HTMLElement;
        elm.textContent = (isSampleChanged() ? '● ' : '') + `~/work/${sampleSelector.value}.ts - IDE`
    }

    function isSampleChanged() {
        const sampleText = samples[sampleSelector.value as keyof typeof samples].code;
        const actualText = model.getValue();
        return sampleText !== actualText;
    }

    const shareBtn = document.querySelector('#share') as HTMLElement;
    const discardBtn = document.querySelector('#discard') as HTMLElement;
    model.onDidChangeContent(() => {
        localStorage.setItem(`sample-code[${sampleSelector.value}]`, model.getValue());
        updateTitle();
        const changed = isSampleChanged();
        shareBtn.style.display = changed ? 'block' : 'none';
        discardBtn.style.display = changed ? 'block' : 'none';
    });

    if (window.location.hash) {
        try {
            const choosenSample = 'share_sample';
            sampleSelector.value = choosenSample;
            const codeFragment = /#share-([^\-]*)/.exec(window.location.hash.toString());
            if (!codeFragment) {
                throw new Error('invalid hash');
            }
            const code = decodeCode(codeFragment[1]);
            localStorage.setItem(`sample-code[${choosenSample}]`, code);
            sampleSelector.onchange(null as any);
        } catch(e) {
            alert('failed to open the link');
            const choosenSample = localStorage.getItem('code-sample') || 'basic';
            sampleSelector.value = choosenSample;
            sampleSelector.onchange(null as any);
        }
    } else {
        const choosenSample = localStorage.getItem('code-sample') || 'basic';
        sampleSelector.value = choosenSample;
        sampleSelector.onchange(null as any);
    }



    return {
        setText: (text: string) => model.setValue(text),
        getText: (): string => model.getValue(),
    }

}
