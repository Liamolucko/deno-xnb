import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import { Reader } from "../readers.ts";
import BooleanReader from "./boolean.ts";

/** Nullable Reader */
class NullableReader<T = any> implements Reader<T | null> {
  constructor(private reader: Reader<T>) {}

  /**
   * Reads Nullable type from buffer.
   * @param buffer
   * @param resolver
   * @returns
   */
  read(buffer: BufferReader, resolver?: ReaderResolver | null): T | null {
    // read in if the nullable has a value or not
    const hasValue = BooleanReader.read(buffer);

    // return the value
    return (hasValue
      ? (this.reader.primitive
        ? this.reader.read(buffer)
        : resolver?.read(buffer))
      : null);
  }

  /**
   * Writes Nullable into the buffer
   * @param buffer
   * @param data The data
   * @param resolver
   */
  write(
    buffer: BufferWriter,
    content: T | null,
    resolver?: ReaderResolver | null,
  ) {
    buffer.writeByte(content != null ? 1 : 0);
    if (content != null) {
      this.reader.write(
        buffer,
        content,
        (this.reader.primitive ? null : resolver),
      );
    }
  }

  get type() {
    return `Nullable<${this.reader.type}>`;
  }

  get primitive() {
    return false;
  }
}

export default NullableReader;
