import BaseReader from "./BaseReader.ts";
import ReaderResolver from "../ReaderResolver.ts";
import BufferReader from "../../BufferReader.ts";
import BufferWriter from "../../BufferWriter.ts";

/** UInt32 Reader */
class UInt32Reader extends BaseReader<number> {
  /** Reads UInt32 from buffer. */
  read(buffer: BufferReader): number {
    return buffer.readUInt32();
  }

  write(
    buffer: BufferWriter,
    content: number,
    resolver?: ReaderResolver | null,
  ) {
    this.writeIndex(buffer, resolver);
    buffer.writeUInt32(content);
  }
}

export default UInt32Reader;
