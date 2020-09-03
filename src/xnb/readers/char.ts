import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";

/** Gets size of char for some special characters that are more than one byte. */
function getCharSize(byte: number): number {
  return ((0xE5000000 >> ((byte >> 3) & 0x1e)) & 3) + 1;
}

export default {
  /** Reads Char from the buffer. */
  read(buffer: BufferReader): string {
    let charSize = getCharSize(buffer.peekInt());
    return new TextDecoder().decode(buffer.read(charSize));
  },

  /** Writes Char into buffer */
  write(
    buffer: BufferWriter,
    content: string,
    resolver?: ReaderResolver | null,
  ) {
    resolver?.writeIndex(buffer, this);
    const _buf = new Uint8Array(4);
    const charBuf = new TextEncoder().encode(content);
    const size = charBuf.length;
    _buf.set(charBuf);
    buffer.concat(_buf.slice(0, size));
  },

  get type() {
    return "Char";
  },

  get primitive() {
    return true;
  },
};
