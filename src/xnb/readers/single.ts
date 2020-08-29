import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import BaseReader from "./base.ts";

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
