import BaseReader from "./BaseReader.ts";
import BufferReader from "../../BufferReader.ts";
import BufferWriter from "../../BufferWriter.ts";
import BooleanReader from "./BooleanReader.ts";
import ReaderResolver from "../ReaderResolver.ts";

/** Nullable Reader */
class NullableReader<T = any> extends BaseReader<T | null> {
  /** Nullable type */
  reader: BaseReader<T>;

  constructor(reader: BaseReader<T>) {
    super();
    this.reader = reader;
  }

  /**
   * Reads Nullable type from buffer.
   * @param buffer
   * @param resolver
   * @returns
   */
  read(buffer: BufferReader, resolver?: ReaderResolver | null): T | null {
    // get an instance of boolean reader
    const booleanReader = new BooleanReader();
    // read in if the nullable has a value or not
    const hasValue = booleanReader.read(buffer);

    // return the value
    return (hasValue
      ? (this.reader.isValueType()
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
  write(buffer: BufferWriter, content: T | null, resolver?: ReaderResolver | null) {
    //this.writeIndex(buffer, resolver);
    const booleanReader = new BooleanReader();
    buffer.writeByte(content != null ? 1 : 0);
    if (content != null) {
      this.reader.write(
        buffer,
        content,
        (this.reader.isValueType() ? null : resolver),
      );
    }
  }

  isValueType() {
    return false;
  }

  get type() {
    return `Nullable<${this.reader.type}>`;
  }
}

export default NullableReader;
