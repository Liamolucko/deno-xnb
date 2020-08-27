import BaseReader from "./BaseReader.ts";
import BufferReader from "../../BufferReader.ts";
import UInt32Reader from "./UInt32Reader.ts";
import ReaderResolver from "../ReaderResolver.ts";
import BufferWriter from "../../BufferWriter.ts";

/**
 * Array Reader
 * @class
 * @extends BaseReader
 */
class ArrayReader<T = any> extends BaseReader<T[]> {
  reader: BaseReader;

  /**
   * Constructor for the ArrayReader
   * @param reader The reader used for the array elements
   */
  constructor(reader: BaseReader) {
    super();
    this.reader = reader;
  }

  /** Reads Array from buffer. */
  read(buffer: BufferReader, resolver: ReaderResolver): T[] {
    // create a uint32 reader
    const uint32Reader = new UInt32Reader();
    // read the number of elements in the array
    let size = uint32Reader.read(buffer);
    // create local array
    let array = [];

    // loop size number of times for the array elements
    for (let i = 0; i < size; i++) {
      // get value from buffer
      let value = this.reader.isValueType()
        ? this.reader.read(buffer)
        : resolver.read(buffer);
      // push into local array
      array.push(value);
    }

    // return the array
    return array;
  }

  /** Writes Array into buffer */
  write(
    buffer: BufferWriter,
    content: T[],
    resolver?: ReaderResolver | null,
  ) {
    // write the index
    this.writeIndex(buffer, resolver);
    // create a uint32 reader
    const uint32Reader = new UInt32Reader();
    // write the number of elements in the array
    uint32Reader.write(buffer, content.length, resolver);

    // loop over array to write array contents
    for (let item of content) {
      this.reader.write(
        buffer,
        item,
        (this.reader.isValueType() ? null : resolver),
      );
    }
  }

  isValueType() {
    return false;
  }

  get type() {
    return `Array<${this.reader.type}>`;
  }
}

export default ArrayReader;
