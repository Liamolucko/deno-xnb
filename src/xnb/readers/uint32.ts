import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";

export default {
  /** Reads UInt32 from buffer. */
  read(buffer: BufferReader): number {
    return buffer.readUInt32();
  },

  write(
    buffer: BufferWriter,
    content: number,
    resolver?: ReaderResolver | null,
  ) {
    resolver?.writeIndex(buffer, this);
    buffer.writeUInt32(content);
  },

  get type() {
    return "UInt32";
  },

  get primitive() {
    return true;
  },
};
