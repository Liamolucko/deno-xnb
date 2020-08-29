import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import BaseReader from "./base.ts";

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
