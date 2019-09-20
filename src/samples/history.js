// mananges shell history
const data = cli({
    name: 'history',
    description: 'mananges shell history',
    options: {
        clear: option('boolean')
            .alias('c')
            .description('clears the history'),
    }
});

if (data.options.clear) {
    historyMgr.clear();
} else {
    historyMgr.items.forEach(item => console.log(item));
}
