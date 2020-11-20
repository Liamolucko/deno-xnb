import {
  BinaryReader,
  BinaryWriter,
  getReader,
  Reader,
  ReaderManager,
  Type,
} from "../mod.ts";
import UInt32Reader from "./uint32.ts";

/** List Reader */
class ListReader<T> implements Reader<T[]> {
  constructor(private reader: Reader<T>) {}

  /** Reads List from buffer. */
  readFrom(buffer: BinaryReader, resolver: ReaderManager): T[] {
    const size = UInt32Reader.readFrom(buffer);

    const list = [];
    for (let i = 0; i < size; i++) {
      list.push(
        this.reader.isPolymorphic
          ? resolver.readFrom(buffer, this.reader)
          : this.reader.readFrom(buffer, resolver),
      );
    }
    return list;
  }

  /** Writes List into the buffer */
  writeTo(
    buffer: BinaryWriter,
    content: T[],
    resolver: ReaderManager,
  ) {
    UInt32Reader.writeTo(buffer, content.length);
    for (const i in content) {
      if (this.reader.isPolymorphic) resolver.writeIndex(buffer, this.reader);
      this.reader.writeTo(buffer, content[i], resolver);
    }
  }

  readonly type = new Type({
    name: "Microsoft.Xna.Framework.Content.ListReader",
    subtypes: [this.reader.type],
  });

  readonly isPolymorphic = false;

  static is(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Content.ListReader";
  }

  static reads() {
    return false;
  }

  static fromType(type: Type) {
    return new ListReader(getReader(type.subtypes[0]));
  }
}

export default ListReader;
