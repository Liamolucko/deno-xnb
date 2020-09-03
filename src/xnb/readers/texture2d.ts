import * as dxt from "https://denopkg.com/Liamolucko/deno-dxt/mod.ts";
import { BufferReader, BufferWriter } from "../../buffers.ts";
import XnbError from "../../error.ts";
import log from "../../log.ts";
import ReaderResolver from "../reader-resolver.ts";
import Int32Reader from "./int32.ts";
import UInt32Reader from "./uint32.ts";

export interface Texture2D {
  type: "Texture2D";
  data: Uint8Array;
  width: number;
  height: number;
}

export interface Texture2DExport {
  format: number;
  export: Texture2D;
}

export default {
  /** Reads Texture2D from buffer. */
  read(buffer: BufferReader): Texture2DExport {
    let format = Int32Reader.read(buffer);
    let width = UInt32Reader.read(buffer);
    let height = UInt32Reader.read(buffer);
    let mipCount = UInt32Reader.read(buffer);

    if (mipCount > 1) {
      log.warn(`Found mipcount of ${mipCount}, only the first will be used.`);
    }

    let dataSize = UInt32Reader.read(buffer);
    let data = buffer.read(dataSize);

    if (format == 4) {
      data = dxt.decompress(data, width, height, dxt.flags.DXT1);
    } else if (format == 5) {
      data = dxt.decompress(data, width, height, dxt.flags.DXT3);
    } else if (format == 6) {
      data = dxt.decompress(data, width, height, dxt.flags.DXT5);
    } else if (format == 2) {
      // require('fs').writeFileSync('texture.bin', data);
      throw new XnbError("Texture2D format type ECT1 not implemented!");
    } else if (format != 0) {
      throw new XnbError(
        `Non-implemented Texture2D format type (${format}) found.`,
      );
    }

    // add the alpha channel into the image
    for (let i = 0; i < data.length; i += 4) {
      let inverseAlpha = 255 / data[i + 3];
      data[i] = Math.min(Math.ceil(data[i] * inverseAlpha), 255);
      data[i + 1] = Math.min(Math.ceil(data[i + 1] * inverseAlpha), 255);
      data[i + 2] = Math.min(Math.ceil(data[i + 2] * inverseAlpha), 255);
    }

    return {
      format,
      export: {
        type: "Texture2D",
        data,
        width,
        height,
      },
    };
  },

  /** Writes Texture2D into the buffer */
  write(
    buffer: BufferWriter,
    content: Texture2DExport,
    resolver?: ReaderResolver | null,
  ) {
    resolver?.writeIndex(buffer, this);

    const width = content.export.width;
    const height = content.export.height;

    log.debug(`Width: ${width}, Height: ${height}`);
    log.debug(`Format: ${content.format}`);

    Int32Reader.write(buffer, content.format, null);
    UInt32Reader.write(buffer, content.export.width, null);
    UInt32Reader.write(buffer, content.export.height, null);
    UInt32Reader.write(buffer, 1, null);

    let data = content.export.data;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3] / 255;
      data[i] = Math.floor(data[i] * alpha);
      data[i + 1] = Math.floor(data[i + 1] * alpha);
      data[i + 2] = Math.floor(data[i + 2] * alpha);
    }

    if (content.format == 4) {
      data = dxt.compress(data, width, height, dxt.flags.DXT1);
    } else if (content.format == 5) {
      data = dxt.compress(data, width, height, dxt.flags.DXT3);
    } else if (content.format == 6) {
      data = dxt.compress(data, width, height, dxt.flags.DXT5);
    }

    UInt32Reader.write(buffer, data.length, null);
    buffer.concat(data);
  },

  get type() {
    return "Texture2D";
  },

  get primitive() {
    return false;
  },
};
