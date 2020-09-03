import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import SingleReader from "./single.ts";

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export default {
  /** Reads Vector3 from buffer. */
  read(buffer: BufferReader): Vector3 {
    let x = SingleReader.read(buffer);
    let y = SingleReader.read(buffer);
    let z = SingleReader.read(buffer);

    return { x, y, z };
  },

  write(
    buffer: BufferWriter,
    content: Vector3,
    resolver?: ReaderResolver | null,
  ) {
    resolver?.writeIndex(buffer, this);
    SingleReader.write(buffer, content.x, null);
    SingleReader.write(buffer, content.y, null);
    SingleReader.write(buffer, content.z, null);
  },

  get type() {
    return "Vector3";
  },

  get primitive() {
    return true;
  },
};
