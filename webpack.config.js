const webpack = require('webpack');
const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');
const fs = require('fs');
const remarkGfm = import('remark-gfm');
const remarkMath = import('remark-math');
const rehypeKatex = import('rehype-katex');

module.exports = Promise.all([remarkGfm, remarkMath, rehypeKatex]).then(
    ([remarkGfm, remarkMath, rehypeKatex]) => ({
        target: 'node',
        mode: 'development',
        entry: './src/index.js',
        output: {
            publicPath: '',
            filename: 'bundle.js',
            library: { name: 'bundle', type: 'umd' },
            globalObject: 'this',
        },
        devtool: 'inline-source-map',
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: ['babel-loader'],
                },
                {
                    test: /\.css/,
                    use: ['css-loader', 'postcss-loader'],
                },
                {
                    test: /\.mdx$/,
                    use: [
                        'babel-loader',
                        {
                            loader: '@mdx-js/loader',
                            /** @type {import('@mdx-js/loader').Options} */
                            options: {
                                jsx: true,
                                remarkPlugins: [
                                    remarkGfm.default,
                                    remarkMath.default,
                                ],
                                rehypePlugins: [rehypeKatex.default],
                            },
                        },
                    ],
                },
                {
                    test: /\.(png|jpe?g|gif)$/i,
                    use: [
                        {
                            loader: 'file-loader',
                        },
                    ],
                },
            ],
        },
        plugins: [
            new StaticSiteGeneratorPlugin(
                'bundle.js',
                ['/', '/404.html', '/about_us/', '/articles/'].concat(
                    fs
                        .readdirSync('./src/articles')
                        .filter((a) => a !== 'index.js')
                        .map((a) => '/articles/' + a)
                )
            ),
        ],
        node: {
            __dirname: true,
        },
    })
);
