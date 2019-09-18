const glob = require('glob');
const fs = require('fs');

glob('./node_modules/typed-cli/**/*.d.ts', function(err, files) {
    if (err) {
        throw err;
    }
    files = files.filter(f => f.match(/node_modules/g).length === 1);
    files.push('./bootstrap.d.ts');
    console.log(files);
    files = files.map(filename => {
        const content = fs.readFileSync(filename, 'utf-8');
        return {filename: filename.replace(/^\.\/node_modules\//, 'node_modules/@types/'), content};
    });
    const code = `export const files = ${JSON.stringify(files)};`;
    fs.writeFileSync('./src/lib-generated.ts', code);
})
