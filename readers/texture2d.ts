declare global {
  // iobuffer (dep of fast-png) lists node buffers as one of the input options,
  // which throws a type error since it doesn't exist in Deno.
  // But since it's only one option of a union (and the compiled JavaScript works fine)
  // I can fix the error by just typealiasing it to never.
  type Buffer = never;
}

import * as png from "https://cdn.skypack.dev/fast-png@5.0.2?dts";
import * as dxt from "https://denopkg.com/Liamolucko/deno-dxt/mod.ts";
import {
  BinaryReader,
  BinaryWriter,
  ReaderManager,
  Type,
  XnbError,
} from "../mod.ts";
import Int32Reader from "./int32.ts";
import UInt32Reader from "./uint32.ts";

export interface Texture2D {
  format: number;
  data: Uint8Array;
  width: number;
  height: number;
}

export interface Texture2DExport {
  format: number;
  filename: string;
}

const Texture2DReader = {
  /** Reads Texture2D from buffer. */
  readFrom(buffer: BinaryReader, resolver: ReaderManager) {
    const format = Int32Reader.readFrom(buffer);
    const width = UInt32Reader.readFrom(buffer);
    const height = UInt32Reader.readFrom(buffer);
    const mipCount = UInt32Reader.readFrom(buffer);

    if (mipCount > 1) {
      resolver.logWarning(
        `Found mipcount of ${mipCount}, only the first will be used.`,
      );
    }

    const dataSize = UInt32Reader.readFrom(buffer);
    let data = buffer.readBytes(dataSize);

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
      const inverseAlpha = 255 / data[i + 3];
      data[i] = Math.min(Math.ceil(data[i] * inverseAlpha), 255);
      data[i + 1] = Math.min(Math.ceil(data[i + 1] * inverseAlpha), 255);
      data[i + 2] = Math.min(Math.ceil(data[i + 2] * inverseAlpha), 255);
    }

    return {
      format,
      data,
      width,
      height,
    };
  },

  /** Writes Texture2D into the buffer */
  writeTo(buffer: BinaryWriter, content: Texture2D, manager: ReaderManager) {
    const width = content.width;
    const height = content.height;

    manager.logDebug(`Width: ${width}, Height: ${height}`);
    manager.logDebug(`Format: ${content.format}`);

    Int32Reader.writeTo(buffer, content.format);
    UInt32Reader.writeTo(buffer, content.width);
    UInt32Reader.writeTo(buffer, content.height);
    UInt32Reader.writeTo(buffer, 1);

    let data = content.data;

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

    UInt32Reader.writeTo(buffer, data.length);
    buffer.writeBytes(data);
  },

  type: new Type({ name: "Microsoft.Xna.Framework.Content.Texture2DReader" }),

  isPolymorphic: true,

  export(
    value: Texture2D,
    exportFile: (data: Uint8Array, extension: string) => string,
  ) {
    return {
      format: value.format,
      filename: exportFile(png.encode(value), "png"),
    };
  },

  import(value: Texture2DExport, importFile: (filename: string) => Uint8Array) {
    const image = png.decode(importFile(value.filename));
    return {
      format: value.format,
      width: image.width,
      height: image.height,
      data: image.data,
    };
  },

  is(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Content.Texture2DReader";
  },

  reads(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Graphics.Texture2D";
  },

  fromType() {
    return this;
  },
};

export default Texture2DReader;
