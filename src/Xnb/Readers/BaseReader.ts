import XnbError from "../../XnbError.ts";
import BufferReader from "../../BufferReader.ts";
import BufferWriter from "../../BufferWriter.ts";
import ReaderResolver from "../ReaderResolver.ts";

/** Base class for all readers. */
abstract class BaseReader<T = any> {
  /**
   * Returns if type normally requires a special reader.
   * @returns Returns true if type is primitive.
   */
  isValueType(): boolean {
    return true;
  }

  /** String type of reader. */
  get type(): string {
    return this.constructor.name.slice(0, -6);
  }

  /**
   * Reads the buffer by the specification of the type reader.
   * @public
   * @param buffer The buffer to read from.
   * @param resolver The content reader to resolve readers from.
   * @returns The type as specified by the type reader.
   */
  abstract read(buffer: BufferReader, resolver?: ReaderResolver | null): T;

  /**
   * Writes into the buffer
   * @param buffer The buffer to write to
   * @param data The data to parse to write to the buffer
   * @param resolver ReaderResolver to write non-primitive types
   */
  write(buffer: BufferWriter, content: T, resolver?: ReaderResolver | null): void {
    throw new XnbError(`${this.constructor.name} does not define a write method.`);
  }

  /**
   * Writes the index of this reader to the buffer
   * @param buffer
   * @param resolver 
   */
  writeIndex(buffer: BufferWriter, resolver?: ReaderResolver | null) {
    if (resolver != null) {
      buffer.write7BitNumber(Number.parseInt(resolver.getIndex(this)!) + 1);
    }
  }

  toString(): string {
    return this.type;
  }
}

export default BaseReader;
