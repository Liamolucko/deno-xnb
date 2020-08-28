import { bold, green, red } from "https://deno.land/std@0.66.0/fmt/colors.ts";
import { exists } from "https://deno.land/std@0.66.0/fs/exists.ts";
import { walk } from "https://deno.land/std@0.66.0/fs/walk.ts";
import * as path from "https://deno.land/std@0.66.0/path/mod.ts";
import Denomander from "https://deno.land/x/denomander@0.6.3/mod.ts";
import Log from "./src/Log.ts";
import { exportFile, resolveImports } from "./src/Porter.ts";
import * as xnb from "./src/Xnb.ts";

// used for displaying the tally of success and fail
let success = 0;
let fail = 0;

// create the program and set version number
const program = new Denomander({
  app_name: "xnbcli",
  app_description: "Packs and unpacks XNB files",
  app_version: "1.0.6",
});

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
  .command("unpack [input] [output?]")
  .action(({ input, output }: Record<string, string>) => {
    // process the unpack
    processFiles(unpackFile, input, output, details);
  })
  .description("Used to unpack XNB files.");

// XNB pack Command
program
  .command("pack [input] [output?]")
  .action(({ input, output }: Record<string, string>) => {
    // process the pack
    processFiles(packFile, input, output, details);
  })
  .description("Used to pack XNB files.");

// parse the input and run the commander program
program.parse(Deno.args);

/** Display the results of the processing */
function details() {
  // give a final analysis of the files
  console.log(`${bold(green("Success"))} ${success}`);
  console.log(`${bold(red("Fail"))} ${fail}`);
}

/** 
 * Unpack an XNB file to JSON.
 * @param input The path of the XNB file to unpack.
 * @param output The path at which to save the result.
 */
async function unpackFile(input: string, output: string) {
  // catch any exceptions to keep a batch of files moving
  try {
    // ensure that the input file has the right extension
    if (path.extname(input).toLocaleLowerCase() != ".xnb") {
      return;
    }

    // load the XNB and get the object from it
    Log.info(`Reading file "${input}"...`);
    const result = xnb.unpack(await Deno.readFile(input));

    // save the file
    if (!await exportFile(output, result)) {
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
 * Pack a file to xnb.
 * @param input The path of the JSON file to pack.
 * @param output The path at which to save the resulting file.
 */
async function packFile(input: string, output: string) {
  try {
    // ensure that the input file has the right extension
    if (path.extname(input).toLocaleLowerCase() != ".json") {
      return;
    }

    Log.info(`Reading file "${input}" ...`);

    // resolve the imports
    const json = resolveImports(input);
    // convert the JSON to XNB
    const buffer = xnb.pack(json);

    // write the buffer to the output
    await Deno.writeFile(output, buffer);

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

/** Used to walk a path with input/output for processing */
async function processFiles(
  handler: (input: string, output: string) => any,
  input: string,
  output: string,
  doneCallback: () => any,
) {
  // if this isn't a directory then just run the function
  if (!(await Deno.stat(input)).isDirectory) {
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
    else if ((await Deno.stat(output)).isDirectory) {
      output = path.join(output, path.basename(input, ext) + newExt);
    }

    // call the function
    return handler(input, output);
  }

  // output is undefined
  if (output == undefined) {
    output = input;
  }

  for await (const entry of walk(input)) {
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
      if (!await exists(path.dirname(inputFile))) {
        await Deno.mkdir(outputFile, { recursive: true });
      }

      // run the function
      handler(inputFile, outputFile);
    }

    // The original ignored errors, but I'm not sure how to do that here.
  }

  // done walking the dog
  doneCallback();
}
