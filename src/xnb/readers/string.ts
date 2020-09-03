import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";

export default {
  /** Reads String from buffer. */
  read(buffer: BufferReader): string {
    // read in the length of the string
    let length = buffer.read7BitNumber();
    // read in the UTF-8 encoded string
    return new TextDecoder().decode(buffer.read(length));
  },

  /**
   * Writes the string to the buffer.
   * @param buffer 
   * @param string 
   * @param resolver
   */
  write(
    buffer: BufferWriter,
    string: string,
    resolver?: ReaderResolver | null,
  ) {
    // write the index
    resolver?.writeIndex(buffer, this);
    // create a string buffer for special characters 4 extra bytes per utf8 character
    const charBuf = new TextEncoder().encode(string);
    // write into the buffer and get the size back out
    const size = charBuf.length;
    // write the length of the string
    buffer.write7BitNumber(size);
    // write the string
    buffer.concat(charBuf);
  },

  get type() {
    return "String";
  },

  get primitive() {
    return false;
  },
};
