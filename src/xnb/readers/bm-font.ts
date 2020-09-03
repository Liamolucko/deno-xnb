import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import StringReader from "./string.ts";

export interface BmFont {
  type: "BmFont";
  data: string;
}

export default {
  /** Reads BmFont from buffer. */
  read(buffer: BufferReader): { export: BmFont } {
    const xml = StringReader.read(buffer);
    return { export: { type: "BmFont", data: xml } };
  },

  /** Writes BmFont into buffer. */
  write(
    buffer: BufferWriter,
    content: BmFont,
    resolver?: ReaderResolver | null,
  ) {
    // write index of reader
    resolver?.writeIndex(buffer, this);
    StringReader.write(buffer, content.data, null);
  },

  get primitive() {
    return false;
  },

  get type() {
    return "BmFont";
  },
};
