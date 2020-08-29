import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import BaseReader from "./base.ts";

/** Boolean Reader */
class BooleanReader extends BaseReader<boolean> {
  /** Reads Boolean from buffer. */
  read(buffer: BufferReader): boolean {
    return Boolean(buffer.readInt());
  }

  /** Writes Boolean into buffer */
  write(
    buffer: BufferWriter,
    content: boolean,
    resolver?: ReaderResolver | null,
  ) {
    this.writeIndex(buffer, resolver);
    buffer.writeByte(Number(content));
  }
}

export default BooleanReader;
