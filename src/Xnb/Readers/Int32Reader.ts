import BufferReader from "../../BufferReader.ts";
import BufferWriter from "../../BufferWriter.ts";
import ReaderResolver from "../ReaderResolver.ts";
import BaseReader from "./BaseReader.ts";

/** Int32 Reader */
class Int32Reader extends BaseReader<number> {
  /**
   * Reads Int32 from buffer.
   * @param buffer
   */
  read(buffer: BufferReader): number {
    return buffer.readInt32();
  }

  /**
   * Writes Int32 and returns buffer
   * @param buffer
   * @param content
   * @param resolver
   */
  write(
    buffer: BufferWriter,
    content: number,
    resolver?: ReaderResolver | null,
  ) {
    this.writeIndex(buffer, resolver);
    buffer.writeInt32(content);
  }
}

export default Int32Reader;
