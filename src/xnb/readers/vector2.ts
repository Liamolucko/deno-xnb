import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import SingleReader from "./single.ts";

export interface Vector2 {
  x: number;
  y: number;
}

export default {
  /** Reads Vector2 from buffer. */
  read(buffer: BufferReader): Vector2 {
    let x = SingleReader.read(buffer);
    let y = SingleReader.read(buffer);

    return { x, y };
  },

  write(
    buffer: BufferWriter,
    content: Vector2,
    resolver?: ReaderResolver | null,
  ) {
    resolver?.writeIndex(buffer, this);
    SingleReader.write(buffer, content.x, null);
    SingleReader.write(buffer, content.y, null);
  },

  get type() {
    return "Vector2";
  },

  get primitive() {
    return true;
  },
};
