import {cli as _cli, option as _option, command as _command} from 'typed-cli';

declare global {
    const cli: typeof _cli;
    const option: typeof _option;
    const command: typeof _command;
}
