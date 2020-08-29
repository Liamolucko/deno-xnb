import { BufferReader, BufferWriter } from "../../buffers.ts";
import BaseReader from "./base.ts";
import SingleReader from "./single.ts";
import ReaderResolver from "../reader-resolver.ts";

export interface Vector2 {
  x: number;
  y: number;
}

/** Vector2 Reader */
class Vector2Reader extends BaseReader<Vector2> {
  /** Reads Vector2 from buffer. */
  read(buffer: BufferReader): Vector2 {
    const singleReader = new SingleReader();

    let x = singleReader.read(buffer);
    let y = singleReader.read(buffer);

    return { x, y };
  }

  write(
    buffer: BufferWriter,
    content: Vector2,
    resolver?: ReaderResolver | null,
  ) {
    this.writeIndex(buffer, resolver);
    const singleReader = new SingleReader();
    singleReader.write(buffer, content.x, null);
    singleReader.write(buffer, content.y, null);
  }
}

export default Vector2Reader;
