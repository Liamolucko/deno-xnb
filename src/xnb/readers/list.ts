import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import { Reader } from "../readers.ts";
import UInt32Reader from "./uint32.ts";

/** List Reader */
class ListReader<T = any> implements Reader<T[]> {
  constructor(private reader: Reader<T>) {}

  /**
   * Reads List from buffer.
   * @param buffer
   * @param resolver
   */
  read(buffer: BufferReader, resolver: ReaderResolver): T[] {
    const size = UInt32Reader.read(buffer);

    const list = [];
    for (let i = 0; i < size; i++) {
      const value = this.reader.primitive
        ? this.reader.read(buffer)
        : resolver.read(buffer);
      list.push(value);
    }
    return list;
  }

  /**
   * Writes List into the buffer
   * @param buffer
   * @param data The data
   * @param resolver
   */
  write(
    buffer: BufferWriter,
    content: T[],
    resolver?: ReaderResolver | null,
  ) {
    resolver?.writeIndex(buffer, this);
    UInt32Reader.write(buffer, content.length, null);
    for (let i in content) {
      this.reader.write(
        buffer,
        content[i],
        (this.reader.primitive ? null : resolver),
      );
    }
  }

  get type() {
    return `List<${this.reader.type}>`;
  }

  get primitive() {
    return true;
  }
}

export default ListReader;
