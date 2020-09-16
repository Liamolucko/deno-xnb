import { BinaryReader, BinaryWriter } from "./binary.ts";
import XnbError from "./error.ts";
import log from "./log.ts";
import { Reader, Type } from "./types.ts";

/** Class used to read the XNB types using the readers */
export default class ReaderManager {
  /**
   * Creating a new instance of ReaderManager
   * @param readers Array of BaseReaders
   */
  constructor(private readers: Reader<unknown>[]) {}

  /**
   * Reads XNB content annotated with the index of its reader.
   * @param buffer The buffer to read from.
   * @param expect Expected reader to resolve, throws if incorrect. 
   */
  readFrom<T>(buffer: BinaryReader): unknown;
  readFrom<T>(buffer: BinaryReader, expect: Reader<T>): T;
  readFrom<T>(buffer: BinaryReader, expect?: Reader<T>) {
    // read the index of which reader to use
    let index = buffer.read7BitEncodedNumber() - 1;
    if (index >= this.readers.length) {
      throw new XnbError(`Invalid reader index ${index}`);
    }
    const reader = this.readers[index];
    if (typeof expect !== "undefined" && !reader.type.equals(expect.type)) {
      throw new XnbError(
        `Expected reader ${expect.type.name}, found ${reader.type.name}`,
      );
    }

    // read the buffer using the selected reader
    return reader.readFrom(buffer, this);
  }

  /** Writes the XNB file contents. */
  writeTo(buffer: BinaryWriter, content: unknown) {
    // Write initial index; only readers containing other types should have to worry about this.
    buffer.write7BitEncodedNumber(1);
    this.readers[0].writeTo(buffer, content, this);
  }

  /** Returns the index of the reader */
  indexOf(reader: Reader<unknown>) {
    const type = reader.type;
    return this.readers
      .findIndex((reader) => type.equals(reader.type));
  }

  /** Returns a reader of a given type, or throws if it doesn't exist */
  get(type: Type) {
    return this.readers
      .find((reader) => type.equals(reader.type));
  }

  writeIndex(buffer: BinaryWriter, reader: Reader<unknown>) {
    buffer.write7BitEncodedNumber(this.indexOf(reader) + 1);
  }

  logInfo = log.info;
  logDebug = log.debug;
  logWarning = log.warn;
  logError = log.error;
  logBinary = log.b;
  logHex = log.h;
}
