export const basic = {"code":"const data = cli({\n    name: 'calc',\n    description: 'Calculate expressions',\n    options: {\n        operation: option('string')\n            .alias('o')\n            .required()\n            .description('opeartion to be applied'),\n        round: option('boolean').alias('r').description('rounds the result'),\n    },\n    _: option('number').array()\n});\n\nconst OperatorMap = {\n    '+': (prev, cur) => prev + cur,\n    '/': (prev, cur) => prev / cur,\n    '-': (prev, cur) => prev - cur,\n    '*': (prev, cur) => prev * cur,\n};\n\n// Type safe!\n// n1: number\n// n2: number\n// (place a cursor on a variable to see its type)\nconst [n1, n2] = data._;\n\n// Type safe!\n// op: string\nconst op = data.options.operation;\n\nconsole.log(`Calculating: ${n1} ${op} ${n2} = ${[n1, n2].reduce(OperatorMap[op])}`);\n","name":"basic","description":"basic cli usage"}

export const git = {"code":"cli.commands({\n    program: 'git',\n    description: 'Git is a free and open source distributed'\n            + ' version control system designed to handle everything'\n            + ' from small to very large projects with speed and efficiency.',\n    completer: true,\n}, {\n    // reset\n    reset: command({\n        description: 'Reset current HEAD to the specified state',\n        options: {\n            hard: option('boolean').description('Resets the index and working tree'),\n            soft: option('boolean').description('Does not touch the index file or the working tree at all'),\n            mixed: option('boolean').description('Resets the index but not the working tree'),\n        }\n    })\n        .handle(data => console.log('executing reset with params:', data)),\n\n    // checkout\n    checkout: command({\n        description: 'Switch branches or restore working tree files',\n        options: {\n            b: option('boolean').description('causes a new branch to be created '),\n        },\n        _: option('string').required()\n    })\n        .handle(data => console.log('executing checkout with params:', data))\n})\n\n","name":"git","description":"pseudo git"}

export const help = {"code":"cli.commands({\n    program: 'help',\n    description: 'outputs the manual for this demo',\n    completer: true,\n}, {\n    // default\n    [defaultCommand]: command({\n        description: 'output',\n    }).handle(data => {\n        console.log('This is a pseudo terminal');\n        console.log('Supported shortcuts:');\n        console.log('Ctrl+C (reject input), Ctrl+K (clear terminal) etc.');\n        console.log(`To see more shortcuts - type ${chalk.yellow('help --short')}`);\n        console.log('Type some keys and commands to play around.');\n    }),\n\n    // shortcuts\n    shortcuts: command({\n        description: 'outputs available shortcuts in this demo terminal',\n    }).handle(data => {\n        console.log(chalk.bold('Ctrl+C       ') + chalk.dim(' - reject input'));\n        console.log(chalk.bold('Ctrl+K       ') + chalk.dim(' - clear terminal'));\n        console.log(chalk.bold('Shift+Insert ') + chalk.dim(' - paste into terminal from clipboard'));\n        console.log(chalk.bold('Tab          ') + chalk.dim(' - command completions'));\n        console.log(chalk.bold('Arrow Up/Down') + chalk.dim(' - comand history navigation'));\n    }),\n});\n","name":"help","description":"output the manual for this demo"}