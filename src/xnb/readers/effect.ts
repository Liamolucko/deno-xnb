import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import UInt32Reader from "./uint32.ts";

export interface Effect {
  type: "Effect";
  data: Uint8Array;
}

export default {
  read(buffer: BufferReader): { export: Effect } {
    const size = UInt32Reader.read(buffer);
    const bytecode = buffer.read(size);

    return { export: { type: "Effect", data: bytecode } };
  },

  /**
   * Writes Effects into the buffer
   * @param buffer
   * @param data The data
   * @param resolver
   */
  write(
    buffer: BufferWriter,
    content: Effect,
    resolver: ReaderResolver,
  ) {
    resolver?.writeIndex(buffer, this);

    UInt32Reader.write(buffer, content.data.length, null);
    buffer.concat(content.data);
  },

  get type() {
    return "Effect";
  },

  get primitive() {
    return false;
  },
};
