import BaseReader from "./BaseReader.ts";
import BufferReader from "../../BufferReader.ts";
import BufferWriter from "../../BufferWriter.ts";
import ReaderResolver from "../ReaderResolver.ts";

/** Double Reader */
class DoubleReader extends BaseReader {
  /** Reads Double from buffer. */
  read(buffer: BufferReader): number {
    return buffer.readDouble();
  }

  /** Writes Double into buffer */
  write(
    buffer: BufferWriter,
    content: number,
    resolver?: ReaderResolver | null,
  ) {
    this.writeIndex(buffer, resolver);
  }
}

export default DoubleReader;
