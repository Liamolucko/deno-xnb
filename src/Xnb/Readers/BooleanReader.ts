import BaseReader from "./BaseReader.ts";
import BufferReader from "../../BufferReader.ts";
import BufferWriter from "../../BufferWriter.ts";
import ReaderResolver from "../ReaderResolver.ts";

/**
 * Boolean Reader
 * @class
 * @extends BaseReader
 */
class BooleanReader extends BaseReader {
  /**
     * Reads Boolean from buffer.
     * @param {BufferReader} buffer
     * @returns {Boolean}
     */
  read(buffer: BufferReader): boolean {
    return Boolean(buffer.readInt());
  }

  /**
     * Writes Boolean into buffer
     * @param {BufferWriter} buffer
     * @param {Mixed} data
     * @param {ReaderResolver}
     */
  write(
    buffer: BufferWriter,
    content: boolean,
    resolver?: ReaderResolver | null,
  ) {
    this.writeIndex(buffer, resolver);
    buffer.writeByte(content ? 1 : 0);
  }
}

export default BooleanReader;
