const path = require('path');
const webpack = require('webpack');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

// module.exports = {
//     entry: {
//         "app": './src/app.ts',
//         // Package each language's worker and give these filenames in `getWorkerUrl`
//         "editor.worker": 'monaco-editor/esm/vs/editor/editor.worker.js',
//         "json.worker": 'monaco-editor/esm/vs/language/json/json.worker',
//         "css.worker": 'monaco-editor/esm/vs/language/css/css.worker',
//         "html.worker": 'monaco-editor/esm/vs/language/html/html.worker',
//         "ts.worker": 'monaco-editor/esm/vs/language/typescript/ts.worker',
//       },

//     module: {
//         rules: [
//             {
//                 test: /\.tsx?$/,
//                 use: 'awesome-typescript-loader'
//             },
//             {
//                 test: /\.js$/,
//                 use: ['source-map-loader'],
//                 enforce: "pre"
//             },
//             {
//                 test: /\.css$/,
//                 use: ['style-loader', 'css-loader']
//             }
//         ],
//     },
//     resolve: {
//         extensions: ['.tsx', '.ts', '.js']
//     },
//     output: {
//         publicPath: './dist/',
//         globalObject: 'self',
//         filename: '[name].bundle.js',
//         path: path.resolve(__dirname, 'dist')
//     },
//     devtool: 'source-map'
// };


// module.exports = {
//     entry: './src/app.ts',
//     module: {
//         rules: [
//             {
//                 test: /\.tsx?$/,
//                 use: 'awesome-typescript-loader'
//             },
//             {
//                 test: /\.js$/,
//                 use: ['source-map-loader'],
//                 enforce: "pre"
//             },
//             {
//                 test: /\.css$/,
//                 use: ['style-loader', 'css-loader']
//             }
//         ],
//     },
//     resolve: {
//         extensions: ['.tsx', '.ts', '.js']
//     },
//     output: {
//         publicPath: './dist/',
//         globalObject: 'self',
//         filename: '[name].bundle.js',
//         path: path.resolve(__dirname, 'dist')
//     },
//     plugins: [
//         new MonacoWebpackPlugin({
//             languages: ['javascript', 'css', 'html', 'typescript', 'json']
//         })
//       ],
//     devtool: 'source-map'
// };



module.exports = {
    entry: './src/app.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'awesome-typescript-loader'
            },
            {
                test: /\.js$/,
                use: ['source-map-loader'],
                enforce: "pre"
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.mjs$/,
                include: /node_modules/,
                type: "javascript/auto",
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.css', '.mjs']
    },
    output: {
        publicPath: './dist/',
        globalObject: 'self',
        filename: 'app.bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'source-map',
    node: {
        fs: 'empty',
        child_process: 'empty',
        readline: 'empty'
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(
            /tabtab/,
            `${__dirname}/tabtab-mock.js`
          )
    ]
};
