// pseudo git
import {cli, option, command} from 'typed-cli';

cli.commands({
    program: 'git',
    description: 'Git is a free and open source distributed'
            + ' version control system designed to handle everything'
            + ' from small to very large projects with speed and efficiency.',
    completer: true,
}, {
    // reset
    reset: command({
        description: 'Reset current HEAD to the specified state',
        options: {
            hard: option.boolean.description('Resets the index and working tree'),
            soft: option.boolean.description('Does not touch the index file or the working tree at all'),
            mixed: option.boolean.description('Resets the index but not the working tree'),
        }
    })
        .handle(data => console.log('executing reset with params:', data)),

    // checkout
    checkout: command({
        description: 'Switch branches or restore working tree files',
        options: {
            b: option.boolean.description('causes a new branch to be created '),
        },
        _: option.string.required()
    })
        .handle(data => console.log('executing checkout with params:', data))
})

