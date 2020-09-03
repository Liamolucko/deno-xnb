import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";

export default {
  /** Reads Double from buffer. */
  read(buffer: BufferReader): number {
    return buffer.readDouble();
  },

  /** Writes Double into buffer */
  write(
    buffer: BufferWriter,
    content: number,
    resolver?: ReaderResolver | null,
  ) {
    resolver?.writeIndex(buffer, this);
    buffer.writeSingle(content);
  },

  get type() {
    return "Single";
  },

  get primitive() {
    return true;
  },
};
