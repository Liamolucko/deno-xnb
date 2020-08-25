import { blue, bold, gray, magenta, red, yellow } from "https://deno.land/std@0.66.0/fmt/colors.ts";

const LOG_DEBUG = 0b0001;
const LOG_INFO = 0b0010;
const LOG_WARN = 0b0100;
const LOG_ERROR = 0b1000;

let _info = true, _warn = true, _error = true, _debug = false;

/**
 * Log class with static members to log messages to the console.
 * @class
 * @static
 */
class Log {

    static get DEBUG()  { return LOG_DEBUG; }
    static get INFO()   { return LOG_INFO; }
    static get WARN()   { return LOG_WARN; }
    static get ERROR()  { return LOG_ERROR; }

    /**
     * Sets the debug mode setting.
     * @public
     * @method setMode
     * @param {Number} log
     * @param {Boolean} state
     */
    static setMode(log: number, state: boolean) {
        if (log & LOG_DEBUG)
            _debug = state;
        if (log & LOG_INFO)
            _info = state;
        if (log & LOG_WARN)
            _warn = state;
        if (log & LOG_ERROR)
            _error = state;
    }

    /**
     * Displays an info message
     * @param {String} message Message to display to the console as info.
     */
    static info(message: string = '') {
        if (_info)
            console.log(bold(blue('[INFO] ')) + message);
    }

    /**
     * Displays a debug message
     * @param {String} message Message to display to the console if debug is enabled.
     */
    static debug(message: string = '') {
        if (_debug)
            console.log(bold(magenta('[DEBUG] ')) + message);
    }

    /**
     * Displays a warning message
     * @param {String} message Message to display to the console as a warning.
     */
    static warn(message: string = '') {
        if (_warn)
            console.log(bold(yellow('[WARN] ')) + message);
    }

    /**
     * Displays an error message
     * @param {String} message Message to display to the console as an error.
     */
    static error(message: string = '') {
        if (_error)
            console.log(bold(red('[ERROR] ')) + message);
    }

    /**
     * Displays a binary message
     * @param {Number} n
     * @param {Number} size
     * @param {Number} sliceBegin
     * @param {Number} sliceEnd
     * @returns {String}
     */
    static b(n: number, size: number = 8, sliceBegin: number = -1, sliceEnd: number = -1): string {
        var z = ''
        while (z.length < size)
            z += '0';
        z = z.slice(n.toString(2).length) + n.toString(2);
        if (sliceBegin == -1 && sliceEnd == -1)
            return `0b${z}`;
        return  gray('0b') +
                gray(z.slice(0, sliceBegin)) +
                bold(blue('[')) + bold(z.slice(sliceBegin, sliceEnd)) + bold(blue(']')) +
                gray(z.slice(sliceEnd));
    }

    /**
     * Displays a hex message
     * @param {Number} n
     * @returns {String}
     */
    static h(n: number): string {
        return `0x${n.toString(16)}`;
    }
}

// export the log
export default Log;
