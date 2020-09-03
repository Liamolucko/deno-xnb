import {
  blue,
  bold,
  gray,
  magenta,
  red,
  yellow,
} from "https://deno.land/std@0.67.0/fmt/colors.ts";

/** Logger with functions to log messages to the console. */
export default {
  showInfo: false,
  showWarnings: false,
  showErrors: false,
  showDebug: false,

  /**
   * Displays an info message
   * @param message Message to display to the console as info.
   */
  info(message: string = "") {
    if (this.showInfo) {
      console.log(bold(blue("[INFO] ")) + message);
    }
  },

  /**
   * Displays a debug message
   * @param message Message to display to the console if debug is enabled.
   */
  debug(message: string = "") {
    if (this.showDebug) {
      console.log(bold(magenta("[DEBUG] ")) + message);
    }
  },

  /**
   * Displays a warning message
   * @param message Message to display to the console as a warning.
   */
  warn(message: string = "") {
    if (this.showWarnings) {
      console.log(bold(yellow("[WARN] ")) + message);
    }
  },

  /**
   * Displays an error message
   * @param message Message to display to the console as an error.
   */
  error(message: string = "") {
    if (this.showErrors) {
      console.log(bold(red("[ERROR] ")) + message);
    }
  },

  /** Displays a binary message */
  b(
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
  },

  /** Displays a hex message */
  h(n: number): string {
    return `0x${n.toString(16)}`;
  },
};
