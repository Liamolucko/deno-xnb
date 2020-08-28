// @deno-types="./upng.d.ts"
import UPNG from "https://cdn.skypack.dev/upng-js";
import { exists } from "https://deno.land/std@0.66.0/fs/exists.ts";
import * as path from "https://deno.land/std@0.66.0/path/mod.ts";
import Log from "./Log.ts";
import { XnbJson } from "./Xnb.ts";
import XnbError from "./XnbError.ts";

// I think this is what the original was trying to do, but I'm not sure.
function getNestedValue(obj: Record<string, any>, keys: string[]): any | null {
  var val = obj;
  for (const key of keys) {
    val = val[key];
    if (val === undefined) return null;
  }
  return val;
}

/** Used to save a parsed XNB file. */
export async function exportFile(
  filename: string,
  xnbObject: { content: Record<string, any> },
) {
  // get the dirname for the file
  const dirname = path.dirname(filename);
  // get the basename for the file
  const basename = path.basename(filename, ".json");

  // create folder path if it doesn't exist
  if (!await exists(dirname)) {
    Deno.mkdirSync(dirname, { recursive: true });
  }

  // ensure we have content field
  if (!xnbObject.hasOwnProperty("content")) {
    throw new XnbError("Invalid object!");
  }

  // pull reference of content out of data
  const content = xnbObject.content;
  // search the content object for exports to process
  const found = search(content, "export");

  // if we found data to export
  if (found) {
    // get the key path from found
    const keyPath = found.path;
    // get the exported buffer from found
    const exported = found.value;

    if (
      exported == undefined || exported.type == undefined ||
      exported.data == undefined
    ) {
      throw new XnbError("Invalid file export!");
    }

    // log that we are exporting additional data
    Log.info(`Exporting ${exported.type} ...`);

    // set buffer by default
    let buffer = exported.data;
    // set extension by default
    let extension = "bin";

    // resolve found content based on key path if empty then its just content
    const foundContent = (keyPath.length
      ? getNestedValue(content, keyPath)
      : content);

    // switch over possible export types
    // TODO: make this a litle cleaner possibly with its own function
    switch (exported.type) {
      // Texture2D to PNG
      case "Texture2D":
        buffer = UPNG.encode(
          exported.width,
          exported.height,
          exported.data,
          0,
        );

        extension = "png";
        break;

      // Compiled Effects

      case "Effect":
        extension = "cso";
        break;

      // TODO: TBin to tbin or tmx

      case "TBin":
        extension = "tbin";
        break;

      // BmFont Xml

      case "BmFont":
        extension = "xml";
        break;
    }

    // output file name
    const outputFilename = path.resolve(dirname, `${basename}.${extension}`);

    // save the file
    Deno.writeFileSync(outputFilename, buffer);

    // set the exported value to the path
    foundContent["export"] = path.basename(outputFilename);
  }

  // save the XNB object as JSON
  Deno.writeTextFileSync(filename, JSON.stringify(xnbObject, null, 4));

  // successfully exported file(s)
  return true;
}

/** Resolves all exported content back into the object */
export function resolveImports(filename: string): XnbJson {
  // get the directory name
  const dirname = path.dirname(filename);

  // read in the file contents
  const buffer = Deno.readTextFileSync(filename);
  // get the JSON for the contents
  const json = JSON.parse(buffer);

  // need content
  if (!json.hasOwnProperty("content")) {
    throw new XnbError(`${filename} does not have "content".`);
  }

  // pull reference of content out of data
  const content = json.content;
  // search the content object for exports to process
  const found = search(content, "export");

  // if we found data to export
  if (found) {
    // get the key path from found
    const keyPath = found.path;
    // get the exported buffer from found
    const exported = found.value;

    // resolve found content based on key path if empty then its just content
    const foundContent = (keyPath.length
      ? getNestedValue(content, keyPath)
      : content);

    if (exported == undefined) {
      throw new XnbError("Invalid file export!");
    }

    // form the path for the exported file
    const exportedPath = path.join(dirname, exported);
    // load in the exported file
    const exportedFile = Deno.readFileSync(exportedPath);
    // get the extention of the file
    const ext = path.extname(exportedPath);

    // switch over supported file extension types
    switch (ext) {
      // Texture2D to PNG
      case ".png":
        // get the png data
        const png = UPNG.decode(exportedFile);
        // change the exported contents
        const data = {
          data: png.data,
          width: png.width,
          height: png.height,
        };

        if (keyPath.length) {
          getNestedValue(json["content"], keyPath)["export"] = data;
        } else {
          json["content"]["export"] = data;
        }
        break;

      // Compiled Effects

      case ".cso":
        json["content"] = {
          type: "Effect",
          data: exportedFile,
        };
        break;

      // TBin Map

      case ".tbin":
        json["content"] = {
          type: "TBin",
          data: exportedFile,
        };
        break;

      // BmFont Xml

      case ".xml":
        json["content"] = {
          type: "BmFont",
          data: exportedFile.toString(),
        };
        break;
    }
  }

  // return the JSON
  return json;
}

/** Search an object for a given key. */
function search(
  object: Record<string, any>,
  key: string,
  path: string[] = [],
): { path: string[]; value: any } | null {
  // ensure object is defined and is an object
  if (!object || typeof object != "object") {
    return null;
  }

  // if property exists then return it
  if (object.hasOwnProperty(key)) {
    return { path, value: object[key] };
  }

  // search the objects for keys
  for (let [k, v] of Object.entries(object)) {
    if (typeof v == "object") {
      path.push(k);
      return search(v, key, path);
    }
  }

  // didn't find anything
  return null;
}
