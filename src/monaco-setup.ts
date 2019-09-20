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
        model.setValue((samples as any)[sampleSelector.value].code);
        localStorage.setItem('code-sample', sampleSelector.value);
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

    model.onDidChangeContent(() => {
        console.log('changed');
    });

    const choosenSample = localStorage.getItem('code-sample') || 'basic';
    sampleSelector.value = choosenSample;
    sampleSelector.onchange(null as any);

    return {
        setText: (text: string) => model.setValue(text),
        getText: (): string => model.getValue(),
    }

}
