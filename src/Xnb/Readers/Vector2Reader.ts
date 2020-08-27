import BaseReader from "./BaseReader.ts";
import BufferReader from "../../BufferReader.ts";
import SingleReader from "./SingleReader.ts";

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
}

export default Vector2Reader;
