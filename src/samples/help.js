// output the manual for this demo
cli.commands({
    program: 'help',
    description: 'outputs the manual for this demo',
    completer: true,
}, {
    // default
    [defaultCommand]: command({
        description: 'output',
    }).handle(data => {
        console.log(`This is a pseudo terminal. It's ${chalk.underline('interactive')}!`);
        console.log('Supported shortcuts:');
        console.log('Ctrl+C (reject input), Ctrl+K (clear terminal) etc.');
        console.log(`To see more shortcuts - type ${chalk.yellow('help shortcuts')}`);
        console.log('Type some keys and commands to play around.');
        console.log(`Code editor below is ${chalk.underline('interactive')} as well!`);
    }),

    // shortcuts
    shortcuts: command({
        description: 'outputs available shortcuts in this demo terminal',
    }).handle(data => {
        console.log(chalk.bold('Ctrl+C       ') + chalk.dim(' - reject input'));
        console.log(chalk.bold('Ctrl+K       ') + chalk.dim(' - clear terminal'));
        console.log(chalk.bold('Shift+Insert ') + chalk.dim(' - paste into terminal from clipboard'));
        console.log(chalk.bold('Tab          ') + chalk.dim(' - command completions'));
        console.log(chalk.bold('Arrow Up/Down') + chalk.dim(' - comand history navigation'));
    }),
});
