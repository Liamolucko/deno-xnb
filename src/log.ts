/** Logger with functions to log messages to the console. */

import {
  blue,
  bold,
  gray,
  magenta,
  red,
  yellow,
} from "https://deno.land/std@0.67.0/fmt/colors.ts";

namespace log {
  export let showInfo = false,
    showWarnings = false,
    showErrors = false,
    showDebug = false;

  /**
 * Displays an info message
 * @param message Message to display to the console as info.
 */
  export function info(message: string = "") {
    if (showInfo) {
      console.log(bold(blue("[INFO] ")) + message);
    }
  }

  /**
 * Displays a debug message
 * @param message Message to display to the console if debug is enabled.
 */
  export function debug(message: string = "") {
    if (showDebug) {
      console.log(bold(magenta("[DEBUG] ")) + message);
    }
  }

  /**
 * Displays a warning message
 * @param message Message to display to the console as a warning.
 */
  export function warn(message: string = "") {
    if (showWarnings) {
      console.log(bold(yellow("[WARN] ")) + message);
    }
  }

  /**
 * Displays an error message
 * @param message Message to display to the console as an error.
 */
  export function error(message: string = "") {
    if (showErrors) {
      console.log(bold(red("[ERROR] ")) + message);
    }
  }

  /** Displays a binary message */
  export function b(
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
  export function h(n: number): string {
    return `0x${n.toString(16)}`;
  }
}

export default log;
