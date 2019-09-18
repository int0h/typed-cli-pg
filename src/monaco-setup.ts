const parseTmTheme = require('monaco-themes').parseTmTheme;
import {monokai} from './monaco-themes/';
import {files} from './lib-generated';

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

    monaco.editor.defineTheme('monokai', monokai as any);
    monaco.editor.setTheme('monokai');

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

    // monaco.languages.typescript.typescriptDefaults.addExtraLib([
    //     `
    //     export declare const multiplierPowers: {
    //     bit: number;
    //     byte: number;
    //     kb: number;
    //     mb: number;
    //     gb: number;
    //     tb: number;
    //     pb: number;
    //     eb: number;
    //     zb: number;
    //     yb: number;
    // };
    // export declare type StaticFormat = keyof typeof multiplierPowers | 'auto';
    // export declare type FuncFormatter = ((size: number) => string | number);
    // export declare type Format = StaticFormat | FuncFormatter;
    // export declare function formatSize(format: Format, size: number): string | number;

    // `
    // ].join('\n'), 'file:///node_modules/@types/hdd/index.d.ts');

    // monaco.languages.typescript.typescriptDefaults.addExtraLib(
    //     'export declare function add(a: number, b: number): number',
    //     'file:///node_modules/@types/math/index.d.ts'
    // );

    const model = monaco.editor.createModel(
        `import {cli} from 'typed-cli';\n`,
        'typescript',
        monaco.Uri.parse('file:///main.ts')
    );

    monaco.editor.create(document.getElementById("code") as HTMLElement, {
        language: "javascript",
        model: model
    });

    return {
        setText: (text: string) => model.setValue(text),
        getText: (): string => model.getValue(),
    }

}
