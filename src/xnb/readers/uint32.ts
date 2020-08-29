import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import BaseReader from "./base.ts";

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
