import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";

export default {
  /** Reads Boolean from buffer. */
  read(buffer: BufferReader): boolean {
    return Boolean(buffer.readInt());
  },

  /** Writes Boolean into buffer */
  write(
    buffer: BufferWriter,
    content: boolean,
    resolver?: ReaderResolver | null,
  ) {
    resolver?.writeIndex(buffer, this);
    buffer.writeByte(Number(content));
  },

  get primitive() {
    return true;
  },

  get type() {
    return "Boolean";
  },
};
