import {
  BinaryReader,
  BinaryWriter,
  getReader,
  Reader,
  ReaderManager,
  Type,
} from "../mod.ts";
import BooleanReader from "./boolean.ts";

/** Nullable Reader */
class NullableReader<T = unknown> implements Reader<T | null> {
  constructor(private reader: Reader<T>) {}

  /** Reads Nullable type from buffer. */
  readFrom(buffer: BinaryReader, resolver: ReaderManager): T | null {
    // read in if the nullable has a value or not
    const hasValue = BooleanReader.readFrom(buffer);

    // return the value
    return (
      hasValue
        ? (
          this.reader.isPolymorphic
            ? resolver.readFrom(buffer, this.reader)
            : this.reader.readFrom(buffer, resolver)
        )
        : null
    );
  }

  /** Writes Nullable into the buffer. */
  writeTo(
    buffer: BinaryWriter,
    content: T | null,
    resolver: ReaderManager,
  ) {
    BooleanReader.writeTo(buffer, content !== null);
    if (content != null) {
      this.reader.writeTo(
        buffer,
        content,
        resolver,
      );
    }
  }

  readonly type = new Type({
    name: "Microsoft.Xna.Framework.Content.NullableReader",
    subtypes: [this.reader.type],
  });

  readonly isPolymorphic = true;

  static is(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Content.NullableReader";
  }

  static reads() {
    return false;
  }

  static fromType(type: Type) {
    return new NullableReader(getReader(type.subtypes[0]));
  }
}

export default NullableReader;
