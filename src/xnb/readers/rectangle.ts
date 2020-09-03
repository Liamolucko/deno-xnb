import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import Int32Reader from "./int32.ts";

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default {
  /** Reads Rectangle from buffer. */
  read(buffer: BufferReader): Rectangle {
    const x = Int32Reader.read(buffer);
    const y = Int32Reader.read(buffer);
    const width = Int32Reader.read(buffer);
    const height = Int32Reader.read(buffer);

    return { x, y, width, height };
  },

  /**
   * Writes Effects into the buffer
   * @param buffer
   * @param data The data
   * @param resolver
   */
  write(
    buffer: BufferWriter,
    content: Rectangle,
    resolver: ReaderResolver,
  ) {
    resolver?.writeIndex(buffer, this);
    Int32Reader.write(buffer, content.x, null);
    Int32Reader.write(buffer, content.y, null);
    Int32Reader.write(buffer, content.width, null);
    Int32Reader.write(buffer, content.height, null);
  },

  get type() {
    return "Rectangle";
  },

  get primitive() {
    return true;
  },
};
