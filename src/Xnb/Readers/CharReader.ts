import BufferReader from "../../BufferReader.ts";
import BufferWriter from "../../BufferWriter.ts";
import ReaderResolver from "../ReaderResolver.ts";
import BaseReader from "./BaseReader.ts";

/**
 * Char Reader
 * @class
 * @extends BaseReader
 */
class CharReader extends BaseReader {
  /**
     * Reads Char from the buffer.
     * @param {BufferReader} buffer
     * @returns {String}
     */
  read(buffer: BufferReader): string {
    let charSize = this._getCharSize(buffer.peekInt());
    return new TextDecoder().decode(buffer.read(charSize));
  }

  /**
     * Writes Char into buffer
     * @param {BufferWriter} buffer
     * @param {Mixed} data
     * @param {ReaderResolver}
     */
  write(
    buffer: BufferWriter,
    content: string,
    resolver?: ReaderResolver | null,
  ) {
    this.writeIndex(buffer, resolver);
    const _buf = new Uint8Array(4);
    const charBuf = new TextEncoder().encode(content);
    const size = charBuf.length;
    _buf.set(charBuf);
    buffer.concat(_buf.slice(0, size));
  }

  /**
     * Gets size of char for some special characters that are more than one byte.
     * @param {Number} byte
     * @returns {Number}
     */
  _getCharSize(byte: number): number {
    return ((0xE5000000 >> ((byte >> 3) & 0x1e)) & 3) + 1;
  }
}

export default CharReader;
