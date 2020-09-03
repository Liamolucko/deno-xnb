import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import SingleReader from "./single.ts";

export interface Vector4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

export default {
  /**
     * Reads Vector4 from buffer.
     * @param buffer
     * @returns
     */
  read(buffer: BufferReader): Vector4 {
    let x = SingleReader.read(buffer);
    let y = SingleReader.read(buffer);
    let z = SingleReader.read(buffer);
    let w = SingleReader.read(buffer);

    return { x, y, z, w };
  },

  write(
    buffer: BufferWriter,
    content: Vector4,
    resolver?: ReaderResolver | null,
  ) {
    resolver?.writeIndex(buffer, this);
    SingleReader.write(buffer, content.x, null);
    SingleReader.write(buffer, content.y, null);
    SingleReader.write(buffer, content.z, null);
    SingleReader.write(buffer, content.w, null);
  },

  get type() {
    return "Vector4";
  },

  get primitive() {
    return true;
  },
};
