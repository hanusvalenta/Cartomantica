module.exports = {
    entry: './main.js',
    output: {
        filename: 'bundle.js',
        path: __dirname + '/dist'
    },
    resolve: {
        fallback: {
            fs: false,
            path: false
        }
    }
};
