import { Command } from "https://cdn.depjs.com/cmd/mod.ts";
import { walkSync } from "https://deno.land/std@0.65.0/fs/walk.ts";
import { bold, green, red } from "https://deno.land/std@0.66.0/fmt/colors.ts";
import * as fs from "https://deno.land/std@0.66.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.66.0/path/mod.ts";
import Log from './app/Log.ts';
import { exportFile, resolveImports } from "./app/Porter.ts";
import Xnb from "./app/Xnb/index.js";

// used for displaying the tally of success and fail
let success = 0;
let fail = 0;

// define the version number
const VERSION = "1.0.6";

// create the program and set version number
const program = new Command("xnbcli");
program.version(VERSION);

// turn on debug printing
program.option("--debug", "Enables debug verbose printing.", () => {
  Log.setMode(Log.DEBUG, true);
});

// only display errors
program.option("--errors", "Only prints error messages.", () => {
  Log.setMode(Log.INFO | Log.WARN | Log.DEBUG, false);
});

// XNB unpack command
program
  .command("unpack <input> [output]")
  .action((input, output) => {
    // process the unpack
    processFiles(processUnpack, input, output, details);
  })
  .description("Used to unpack XNB files.");

// XNB pack Command
program
  .command("pack <input> [output]")
  .action((input, output) => {
    // process the pack
    processFiles(processPack, input, output, details);
  })
  .description("Used to pack XNB files.");

// default action
program.action(() => program.help());

// parse the input and run the commander program
program.parse(process.argv);

// show help if we didn't specify any valid input
if (!Deno.args.slice(2).length) {
  program.help();
}

/**
 * Display the results of the processing
 */
function details() {
  // give a final analysis of the files
  console.log(`${bold(green("Success"))} ${success}`);
  console.log(`${bold(red("Fail"))} ${fail}`);
}

/**
 * Takes input and processes input for unpacking.
 * @param {String} input
 * @param {String} output
 */
function processUnpack(input: string, output: string) {
  // catch any exceptions to keep a batch of files moving
  try {
    // ensure that the input file has the right extension
    if (path.extname(input).toLocaleLowerCase() != ".xnb") {
      return;
    }

    // create new instance of XNB
    const xnb = new Xnb();

    // load the XNB and get the object from it
    const result = xnb.load(input);

    // save the file
    if (!exportFile(output, result)) {
      Log.error(`File ${output} failed to save!`);
      return fail++;
    }

    // log that the file was saved
    Log.info(`Output file saved: ${output}`);

    // increase success count
    success++;
  } catch (ex) {
    // log out the error
    Log.error(`Filename: ${input}\n${ex.stack}\n`);
    // increase fail count
    fail++;
  }
}

/**
 * Process the pack of files to xnb
 * @param {String} input
 * @param {String} output
 * @param {Function} done
 */
function processPack(input: string, output: string) {
  try {
    // ensure that the input file has the right extension
    if (path.extname(input).toLocaleLowerCase() != ".json") {
      return;
    }

    Log.info(`Reading file "${input}" ...`);

    // create instance of xnb
    const xnb = new Xnb();

    // resolve the imports
    const json = resolveImports(input);
    // convert the JSON to XNB
    const buffer = xnb.convert(json);

    // write the buffer to the output
    Deno.writeFileSync(output, buffer);

    // log that the file was saved
    Log.info(`Output file saved: ${output}`);

    // increase success count
    success++;
  } catch (ex) {
    // log out the error
    Log.error(`Filename: ${input}\n${ex.stack}\n`);
    // increase fail count
    fail++;
  }
}

/**
 * Used to walk a path with input/output for processing
 * @param {Function} fn
 * @param {String} input
 * @param {String} output
 * @param {Function} cb
 */
function processFiles(
  fn: Function,
  input: string,
  output: string,
  cb: Function,
) {
  // if this isn't a directory then just run the function
  if (!Deno.statSync(input).isDirectory) {
    // get the extension from the original path name
    const ext = path.extname(input);
    // get the new extension
    const newExt = (ext == ".xnb" ? ".json" : ".xnb");

    // output is undefined or is a directory
    if (output == undefined) {
      output = path.join(
        path.dirname(input),
        path.basename(input, ext) + newExt,
      );
    } // output is a directory
    else if (Deno.statSync(output).isDirectory) {
      output = path.join(output, path.basename(input, ext) + newExt);
    }

    // call the function
    return fn(input, output);
  }

  // output is undefined
  if (output == undefined) {
    output = input;
  }

  for (const entry of walkSync(input)) {
    // when we encounter a file
    if (entry.isFile) {
      // get the extension
      const ext = path.extname(entry.name).toLocaleLowerCase();
      // skip files that aren't JSON or XNB
      if (ext != ".json" && ext != ".xnb") {
        continue;
      }

      // swap the input base directory with the base output directory for our target directory
      const target = entry.path.replace(input, output);
      // get the source path
      const inputFile = path.join(entry.path, entry.name);
      // get the target ext
      const targetExt = ext == ".xnb" ? ".json" : ".xnb";
      // form the output file path
      const outputFile = path.join(
        target,
        path.basename(entry.name, ext) + targetExt,
      );

      // ensure the path to the output file exists
      if (!fs.existsSync(path.dirname(inputFile))) {
        Deno.mkdirSync(outputFile, { recursive: true });
      }

      // run the function
      fn(inputFile, outputFile);
    }

    // The original ignored errors, but I'm not sure how to do that here.
  }

  // done walking the dog
  cb();
}
