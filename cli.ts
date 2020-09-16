import { bold, green, red } from "https://deno.land/std@0.69.0/fmt/colors.ts";
import { exists } from "https://deno.land/std@0.69.0/fs/exists.ts";
import { walk } from "https://deno.land/std@0.69.0/fs/walk.ts";
import * as path from "https://deno.land/std@0.69.0/path/mod.ts";
import { Command } from "https://deno.land/x/cliffy@v0.14.1/command/mod.ts";
import * as xnb from "./mod.ts";
import { readXnb, saveXnb } from "./src/export.ts";
import log from "./src/log.ts";

// used for displaying the tally of success and fail
let successes: string[] = [];
let fails: Array<{ file: string; error?: unknown }> = [];

// create the program and set version number
const cmd = new Command<{ debug: boolean; onlyErrors: boolean }>()
  .name("xnbcli")
  .version("2.0.0")
  .description("Packs and unpacks XNB files");

cmd.option(
  "--debug",
  "Enable verbose debug printing.",
  { global: true, conflicts: ["only-errors"] },
);

cmd.option(
  "--only-errors",
  "Only print error messages.",
  { global: true },
);

// XNB unpack command
cmd
  .command("unpack <input:string> [output:string]", "Used to unpack XNB files.")
  .action((options, input: string, output: string) => {
    // process the unpack
    main(input, output, unpackFile, options);
  });

// XNB pack Command
cmd
  .command("pack <input:string> [output:string]", "Used to pack XNB files.")
  .action((options, input: string, output: string) => {
    // process the pack
    main(input, output, packFile, options);
  });

if (import.meta.main) {
  cmd.parse(Deno.args);
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
    log.info(`Reading file "${input}"...`);
    const result = xnb.unpack(await Deno.readFile(input));

    // save the file
    if (!await saveXnb(output, result)) {
      log.error(`File ${output} failed to save!`);
      return fails.push({ file: input });
    }

    // log that the file was saved
    log.info(`Output file saved: ${output}`);

    // increase success count
    successes.push(input);
  } catch (ex) {
    // log out the error
    log.error(`Filename: ${input}\n${ex.stack}\n`);
    // increase fail count
    fails.push({ file: input, error: ex });
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

    log.info(`Reading file "${input}" ...`);

    // resolve the imports
    const json = await readXnb(input);
    // convert the JSON to XNB
    const buffer = xnb.pack(json);

    // write the buffer to the output
    await Deno.writeFile(output, buffer);

    // log that the file was saved
    log.info(`Output file saved: ${output}`);

    // increase success count
    successes.push(input);
  } catch (ex) {
    // log out the error
    log.error(`Filename: ${input}\n${ex.stack}\n`);
    // increase fail count
    fails.push({ file: input, error: ex });
  }
}

async function main(
  input: string,
  output: string,
  handler: (input: string, output: string) => unknown,
  options: { debug: boolean; onlyErrors: boolean },
) {
  // Configure logger
  log.showInfo = !options.onlyErrors;
  log.showWarnings = !options.onlyErrors;
  log.showErrors = true;
  log.showDebug = options.debug;

  // Expand paths
  input = path.resolve(input);
  output = path.resolve(output);

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
    return await handler(input, output);
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
      const inputFile = entry.path;
      // get the target ext
      const targetExt = ext == ".xnb" ? ".json" : ".xnb";
      // form the output file path
      const outputFile = path.join(
        path.dirname(target),
        path.basename(entry.name, ext) + targetExt,
      );

      // ensure the path to the output file exists
      if (!await exists(path.dirname(inputFile))) {
        await Deno.mkdir(outputFile, { recursive: true });
      }

      // run the function
      await handler(inputFile, outputFile);
    }
  }

  // give a final analysis of the files
  console.log(`${bold(green("Success"))} ${successes.length}`);
  console.log(`${bold(red("Fail"))} ${fails.length}`);

  // This is pretty useful for debugging so I won't remove it just yet.
//   Deno.writeTextFileSync(
//     "./errors.md",
//     fails.map((fail) =>
//       `- **${fail.file}**` +
//       (typeof fail.error === "undefined" ? "" : `: ${fail.error}`)
//     ).join("\n"),
//   );
// }
