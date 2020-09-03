import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";

export default {
  /** Reads Single from the buffer. */
  read(buffer: BufferReader): number {
    return buffer.readSingle();
  },

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
