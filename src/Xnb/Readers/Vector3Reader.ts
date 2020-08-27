import BufferReader from "../../BufferReader.ts";
import BufferWriter from "../../BufferWriter.ts";
import ReaderResolver from "../ReaderResolver.ts";
import BaseReader from "./BaseReader.ts";
import SingleReader from "./SingleReader.ts";

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/** Vector3 Reader */
class Vector3Reader extends BaseReader<Vector3> {
  /** Reads Vector3 from buffer. */
  read(buffer: BufferReader): Vector3 {
    const singleReader = new SingleReader();

    let x = singleReader.read(buffer);
    let y = singleReader.read(buffer);
    let z = singleReader.read(buffer);

    return { x, y, z };
  }

  write(
    buffer: BufferWriter,
    content: Vector3,
    resolver?: ReaderResolver | null,
  ) {
    this.writeIndex(buffer, resolver);
    const singleReader = new SingleReader();
    singleReader.write(buffer, content.x, null);
    singleReader.write(buffer, content.y, null);
    singleReader.write(buffer, content.z, null);
  }
}

export default Vector3Reader;
