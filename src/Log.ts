import {
  blue,
  bold,
  gray,
  magenta,
  red,
  yellow,
} from "https://deno.land/std@0.66.0/fmt/colors.ts";

const LOG_DEBUG = 0b0001;
const LOG_INFO = 0b0010;
const LOG_WARN = 0b0100;
const LOG_ERROR = 0b1000;

let info = true, warn = true, error = true, debug = false;

/** Log class with static members to log messages to the console. */
class Log {
  static get DEBUG() {
    return LOG_DEBUG;
  }
  static get INFO() {
    return LOG_INFO;
  }
  static get WARN() {
    return LOG_WARN;
  }
  static get ERROR() {
    return LOG_ERROR;
  }

  /** Whether to enable logging. */
  static enabled = true;

  /**
   * Sets the debug mode setting.
   */
  static setMode(log: number, state: boolean) {
    if (log & LOG_DEBUG) {
      debug = state;
    }
    if (log & LOG_INFO) {
      info = state;
    }
    if (log & LOG_WARN) {
      warn = state;
    }
    if (log & LOG_ERROR) {
      error = state;
    }
  }

  /**
   * Displays an info message
   * @param message Message to display to the console as info.
   */
  static info(message: string = "") {
    if (this.enabled && info) {
      console.log(bold(blue("[INFO] ")) + message);
    }
  }

  /**
   * Displays a debug message
   * @param message Message to display to the console if debug is enabled.
   */
  static debug(message: string = "") {
    if (this.enabled && debug) {
      console.log(bold(magenta("[DEBUG] ")) + message);
    }
  }

  /**
   * Displays a warning message
   * @param message Message to display to the console as a warning.
   */
  static warn(message: string = "") {
    if (this.enabled && warn) {
      console.log(bold(yellow("[WARN] ")) + message);
    }
  }

  /**
   * Displays an error message
   * @param message Message to display to the console as an error.
   */
  static error(message: string = "") {
    if (this.enabled && error) {
      console.log(bold(red("[ERROR] ")) + message);
    }
  }

  /** Displays a binary message */
  static b(
    n: number,
    size: number = 8,
    sliceBegin: number = -1,
    sliceEnd: number = -1,
  ): string {
    var z = "";
    while (z.length < size) {
      z += "0";
    }
    z = z.slice(n.toString(2).length) + n.toString(2);
    if (sliceBegin == -1 && sliceEnd == -1) {
      return `0b${z}`;
    }
    return gray("0b") +
      gray(z.slice(0, sliceBegin)) +
      bold(blue("[")) + bold(z.slice(sliceBegin, sliceEnd)) + bold(blue("]")) +
      gray(z.slice(sliceEnd));
  }

  /** Displays a hex message */
  static h(n: number): string {
    return `0x${n.toString(16)}`;
  }
}

// export the log
export default Log;
