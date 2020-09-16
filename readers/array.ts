import {
  BinaryReader,
  BinaryWriter,
  getReader,
  Reader,
  ReaderManager,
  Type,
  XnbError,
} from "../mod.ts";
import UInt32Reader from "./uint32.ts";

/** Array Reader */
class ArrayReader<T> implements Reader<T[]> {
  /**
   * Constructor for the ArrayReader
   * @param reader The reader used for the array elements
   */
  constructor(
    private readonly reader: Reader<T>,
  ) {}

  /** Reads Array from buffer. */
  readFrom(buffer: BinaryReader, resolver: ReaderManager): T[] {
    // read the number of elements in the array
    let size = UInt32Reader.readFrom(buffer);
    // create local array
    let array = [];

    // loop size number of times for the array elements
    for (let i = 0; i < size; i++) {
      // get value from buffer
      let value = this.reader.isPolymorphic
        ? resolver.readFrom(buffer, this.reader)
        : this.reader.readFrom(buffer, resolver);
      // push into local array
      array.push(value);
    }

    // return the array
    return array;
  }

  /** Writes Array into buffer */
  writeTo(
    buffer: BinaryWriter,
    content: T[],
    resolver: ReaderManager,
  ) {
    // write the number of elements in the array
    UInt32Reader.writeTo(buffer, content.length);

    // loop over array to write array contents
    for (let item of content) {
      if (this.reader.isPolymorphic) resolver.writeIndex(buffer, this.reader);
      this.reader.writeTo(buffer, item, resolver);
    }
  }

  readonly isPolymorphic = true;

  readonly type = new Type({
    name: "Microsoft.Xna.Framework.Content.ArrayReader",
    subtypes: [this.reader.type],
  });

  static is(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Content.ArrayReader";
  }

  static reads(type: Type) {
    return type.isArray;
  }

  static fromType(type: Type) {
    if (
      typeof type.subtypes === "undefined" || type.subtypes.length !== 1
    ) {
      throw new XnbError("ArrayReader must have 1 subtype.");
    }
    return new ArrayReader(getReader(type.subtypes[0]));
  }
}

export default ArrayReader;
