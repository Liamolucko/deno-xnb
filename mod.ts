import Log from "./src/Log.ts";

// Disable logger when used as module
Log.setMode(Log.INFO | Log.WARN | Log.ERROR | Log.DEBUG, false);

export * from "./src/Xnb.ts";
export { default as XnbError } from "./src/XnbError.ts";

