import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";

export default {
  /**
   * Reads Int32 from buffer.
   * @param buffer
   */
  read(buffer: BufferReader): number {
    return buffer.readInt32();
  },

  /**
   * Writes Int32 and returns buffer
   * @param buffer
   * @param content
   * @param resolver
   */
  write(
    buffer: BufferWriter,
    content: number,
    resolver?: ReaderResolver | null,
  ) {
    resolver?.writeIndex(buffer, this);
    buffer.writeInt32(content);
  },

  get type() {
    return "Int32";
  },

  get primitive() {
    return true;
  },
};
