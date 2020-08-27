import BaseReader from "./BaseReader.ts";
import BufferReader from "../../BufferReader.ts";
import SingleReader from "./SingleReader.ts";

export interface Vector4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

/**
 * Vector4 Reader
 * @class
 * @extends BaseReader
 */
class Vector4Reader extends BaseReader<Vector4> {
  /**
     * Reads Vector4 from buffer.
     * @param buffer
     * @returns
     */
  read(buffer: BufferReader): Vector4 {
    const singleReader = new SingleReader();

    let x = singleReader.read(buffer);
    let y = singleReader.read(buffer);
    let z = singleReader.read(buffer);
    let w = singleReader.read(buffer);

    return { x, y, z, w };
  }
}

export default Vector4Reader;
