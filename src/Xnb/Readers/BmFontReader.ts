import BufferReader from "../../BufferReader.ts";
import BufferWriter from "../../BufferWriter.ts";
import ReaderResolver from "../ReaderResolver.ts";
import BaseReader from "./BaseReader.ts";
import StringReader from "./StringReader.ts";

/** BmFont Reader */
class BmFontReader extends BaseReader {
  /** Reads BmFont from buffer. */
  read(buffer: BufferReader): { export: { type: string; data: string } } {
    const stringReader = new StringReader();
    const xml = stringReader.read(buffer);
    return { export: { type: this.type, data: xml } };
  }

  /** Writes BmFont into buffer. */
  write(
    buffer: BufferWriter,
    content: { data: string },
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
