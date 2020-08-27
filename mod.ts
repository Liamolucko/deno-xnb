import Log from "./src/Log.ts";
// Disable logger when used as module
Log.enabled = false;

export * from "./src/Xnb.ts";
export { default as XnbError } from "./src/XnbError.ts";

