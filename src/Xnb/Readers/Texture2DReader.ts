import * as dxt from "https://denopkg.com/Liamolucko/deno-dxt/mod.ts";
import BufferReader from "../../BufferReader.ts";
import BufferWriter from "../../BufferWriter.ts";
import Log from "../../Log.ts";
import XnbError from "../../XnbError.ts";
import ReaderResolver from "../ReaderResolver.ts";
import BaseReader from "./BaseReader.ts";
import Int32Reader from "./Int32Reader.ts";
import UInt32Reader from "./UInt32Reader.ts";

export interface Texture2D {
  format: number;
  export: {
    type: string;
    data: Uint8Array;
    width: number;
    height: number;
  };
}

/** Texture2D Reader */
class Texture2DReader extends BaseReader<Texture2D> {
  /** Reads Texture2D from buffer. */
  read(buffer: BufferReader): Texture2D {
    const int32Reader = new Int32Reader();
    const uint32Reader = new UInt32Reader();

    let format = int32Reader.read(buffer);
    let width = uint32Reader.read(buffer);
    let height = uint32Reader.read(buffer);
    let mipCount = uint32Reader.read(buffer);

    if (mipCount > 1) {
      Log.warn(`Found mipcount of ${mipCount}, only the first will be used.`);
    }

    let dataSize = uint32Reader.read(buffer);
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
        type: this.type,
        data,
        width,
        height,
      },
    };
  }

  /** Writes Texture2D into the buffer */
  write(
    buffer: BufferWriter,
    content: Texture2D,
    resolver?: ReaderResolver | null,
  ) {
    const int32Reader = new Int32Reader();
    const uint32Reader = new UInt32Reader();

    this.writeIndex(buffer, resolver);

    const width = content.export.width;
    const height = content.export.height;

    Log.debug(`Width: ${width}, Height: ${height}`);
    Log.debug(`Format: ${content.format}`);

    int32Reader.write(buffer, content.format, null);
    uint32Reader.write(buffer, content.export.width, null);
    uint32Reader.write(buffer, content.export.height, null);
    uint32Reader.write(buffer, 1, null);

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

    uint32Reader.write(buffer, data.length, null);
    buffer.concat(data);
  }

  isValueType() {
    return false;
  }
}

export default Texture2DReader;
