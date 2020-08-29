import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import BaseReader from "./base.ts";
import SingleReader from "./single.ts";

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

  write(
    buffer: BufferWriter,
    content: Vector4,
    resolver?: ReaderResolver | null,
  ) {
    this.writeIndex(buffer, resolver);
    const singleReader = new SingleReader();
    singleReader.write(buffer, content.x, null);
    singleReader.write(buffer, content.y, null);
    singleReader.write(buffer, content.z, null);
    singleReader.write(buffer, content.w, null);
  }
}

export default Vector4Reader;
