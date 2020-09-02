import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import BaseReader from "./base.ts";
import StringReader from "./string.ts";

export interface BmFont {
  type: "BmFont";
  data: string;
}

/** BmFont Reader */
class BmFontReader extends BaseReader {
  /** Reads BmFont from buffer. */
  read(buffer: BufferReader): { export: BmFont } {
    const stringReader = new StringReader();
    const xml = stringReader.read(buffer);
    return { export: { type: "BmFont", data: xml } };
  }

  /** Writes BmFont into buffer. */
  write(
    buffer: BufferWriter,
    content: BmFont,
    resolver?: ReaderResolver | null,
  ) {
    // write index of reader
    this.writeIndex(buffer, resolver);
    const stringReader = new StringReader();
    stringReader.write(buffer, content.data, null);
  }

  isValueType() {
    return false;
  }
}

export default BmFontReader;
