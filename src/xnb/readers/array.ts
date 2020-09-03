import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import { Reader } from "../readers.ts";
import UInt32Reader from "./uint32.ts";

/** Array Reader */
class ArrayReader<T = any> implements Reader<T[]> {
  /**
   * Constructor for the ArrayReader
   * @param reader The reader used for the array elements
   */
  constructor(private reader: Reader) {}

  /** Reads Array from buffer. */
  read(buffer: BufferReader, resolver: ReaderResolver): T[] {
    // read the number of elements in the array
    let size = UInt32Reader.read(buffer);
    // create local array
    let array = [];

    // loop size number of times for the array elements
    for (let i = 0; i < size; i++) {
      // get value from buffer
      let value = this.reader.primitive
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
    resolver?.writeIndex(buffer, this);
    // write the number of elements in the array
    UInt32Reader.write(buffer, content.length, resolver);

    // loop over array to write array contents
    for (let item of content) {
      this.reader.write(
        buffer,
        item,
        (this.reader.primitive ? null : resolver),
      );
    }
  }

  get primitive() {
    return false;
  }

  get type() {
    return `Array<${this.reader.type}>`;
  }
}

export default ArrayReader;
