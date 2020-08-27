import BaseReader from "./BaseReader.ts";
import BufferReader from "../../BufferReader.ts";
import BufferWriter from "../../BufferWriter.ts";
import ReaderResolver from "../ReaderResolver.ts";

/** Single Reader */
class SingleReader extends BaseReader<number> {
  /** Reads Single from the buffer. */
  read(buffer: BufferReader): number {
    return buffer.readSingle();
  }

  write(
    buffer: BufferWriter,
    content: number,
    resolver?: ReaderResolver | null,
  ) {
    this.writeIndex(buffer, resolver);
    buffer.writeSingle(content);
  }
}

export default SingleReader;
