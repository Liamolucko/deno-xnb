import { exists } from "https://deno.land/std@0.67.0/fs/exists.ts";
import { readJson } from "https://deno.land/std@0.67.0/fs/read_json.ts";
import { writeJson } from "https://deno.land/std@0.67.0/fs/write_json.ts";
import * as path from "https://deno.land/std@0.67.0/path/mod.ts";
import { getReader, Parsed } from "../mod.ts";
import XnbError from "./error.ts";
import log from "./log.ts";
import { Reader, ReaderWithExports } from "./types.ts";
import { containsKey, isObject } from "./util.ts";

function hasExports<T, E>(
  reader: Reader<T>,
): reader is ReaderWithExports<T, E> {
  return typeof (reader as ReaderWithExports<T, E>).export !== "undefined";
}

/** Saves a parsed XNB file and its exports. */
export async function saveXnb(
  filename: string,
  xnb: Parsed,
) {
  // get the dirname for the file
  const dirname = path.dirname(filename);
  // get the basename for the file
  const basename = path.basename(filename, ".json");

  // create folder path if it doesn't exist
  if (!await exists(dirname)) {
    await Deno.mkdir(dirname, { recursive: true });
  }

  const reader = getReader(xnb.readers[0].type);

  if (hasExports(reader)) {
    xnb.content = reader.export(xnb.content, (data, extname) => {
      const filename = `${basename}.${extname}`;
      log.info(`Exporting ${filename}...`);
      Deno.writeFileSync(path.resolve(dirname, filename), data);
      return filename;
    });
  }

  // save the XNB object as JSON
  await writeJson(filename, xnb, { spaces: 4 });

  // successfully exported file(s)
  return true;
}

/** Reads an unpacked XNB file and its exports into parsed XNB. */
export async function readXnb(filename: string): Promise<Parsed> {
  // get the directory name
  const dirname = path.dirname(filename);

  // get the JSON for the contents
  const json = await readJson(filename);

  if (!checkParsed(json)) {
    throw new XnbError(`Invalid XNB json ${filename}`);
  }

  const reader = getReader(json.readers[0].type);

  if (hasExports(reader)) {
    json.content = reader.import(
      json.content,
      (filename) => Deno.readFileSync(path.resolve(dirname, filename)),
    );
  }

  // return the JSON
  return json;
}

function checkParsed(xnb: unknown): xnb is Parsed {
  return isObject(xnb) &&
    containsKey(xnb, "header") &&
    isObject(xnb.header) &&
    containsKey(xnb.header, "target") &&
    typeof xnb.header.target === "string" &&
    containsKey(xnb.header, "formatVersion") &&
    typeof xnb.header.formatVersion === "number" &&
    containsKey(xnb.header, "hidef") &&
    typeof xnb.header.hidef === "boolean" &&
    containsKey(xnb.header, "compressed") &&
    typeof xnb.header.compressed === "boolean" &&
    containsKey(xnb, "readers") &&
    xnb.readers instanceof Array &&
    xnb.readers.every((reader) =>
      isObject(reader) &&
      containsKey(reader, "type") &&
      typeof reader.type === "string" &&
      containsKey(reader, "version") &&
      typeof reader.version === "number"
    ) &&
    "content" in xnb;
}
