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

function isNumberType(type: Type) {
  return type.name === "System.Byte" || type.name === "System.SByte" ||
    type.name === "System.Int16" || type.name === "System.UInt16" ||
    type.name === "System.Int32" || type.name === "System.UInt32" ||
    type.name === "System.Int64" || type.name === "System.UInt64" ||
    type.name === "System.Single" || type.name === "System.Double" ||
    type.name === "Microsoft.Xna.Framework.Content.ByteReader" ||
    type.name === "Microsoft.Xna.Framework.Content.SByteReader" ||
    type.name === "Microsoft.Xna.Framework.Content.Int16Reader" ||
    type.name === "Microsoft.Xna.Framework.Content.UInt16Reader" ||
    type.name === "Microsoft.Xna.Framework.Content.Int32Reader" ||
    type.name === "Microsoft.Xna.Framework.Content.UInt32Reader" ||
    type.name === "Microsoft.Xna.Framework.Content.Int64Reader" ||
    type.name === "Microsoft.Xna.Framework.Content.UInt64Reader" ||
    type.name === "Microsoft.Xna.Framework.Content.SingleReader" ||
    type.name === "Microsoft.Xna.Framework.Content.DoubleReader";
}

function isIntegerType(type: Type) {
  return type.name === "System.Byte" || type.name === "System.SByte" ||
    type.name === "System.Int16" || type.name === "System.UInt16" ||
    type.name === "System.Int32" || type.name === "System.UInt32" ||
    type.name === "System.Int64" || type.name === "System.UInt64" ||
    type.name === "Microsoft.Xna.Framework.Content.ByteReader" ||
    type.name === "Microsoft.Xna.Framework.Content.SByteReader" ||
    type.name === "Microsoft.Xna.Framework.Content.Int16Reader" ||
    type.name === "Microsoft.Xna.Framework.Content.UInt16Reader" ||
    type.name === "Microsoft.Xna.Framework.Content.Int32Reader" ||
    type.name === "Microsoft.Xna.Framework.Content.UInt32Reader" ||
    type.name === "Microsoft.Xna.Framework.Content.Int64Reader" ||
    type.name === "Microsoft.Xna.Framework.Content.UInt64Reader";
}

// There's no way to create a type guard for a generic as far as I know,
// so I'll just have to use `as`.
function isStringType(type: Type): boolean {
  return type.name === "System.String" ||
    type.name === "Microsoft.Xna.Framework.Content.StringReader";
}

/** Dictionary Reader */
class DictionaryReader<K, V> implements Reader<Map<K, V>, Record<string, V>> {
  /**
     * Constructor for DictionaryReader.
     * @constructor
     * @param key The BaseReader for the dictionary key.
     * @param value The BaseReader for the dictionary value.
     */
  constructor(private key: Reader<K>, private value: Reader<V>) {}

  /**
   * Reads Dictionary from buffer.
   * @param buffer Buffer to read from.
   * @param resolver ReaderManager to read non-primitive types. 
   */
  readFrom(buffer: BinaryReader, resolver: ReaderManager): Map<K, V> {
    // the dictionary to return
    const dictionary = new Map();

    // read in the size of the dictionary
    const size = UInt32Reader.readFrom(buffer);

    // loop over the size of the dictionary and read in the data
    for (let i = 0; i < size; i++) {
      // get the key
      const key = this.key.isPolymorphic
        ? resolver.readFrom(buffer)
        : this.key.readFrom(buffer, resolver);
      // get the value
      const value = this.value.isPolymorphic
        ? resolver.readFrom(buffer)
        : this.value.readFrom(buffer, resolver);

      // assign KV pair to the dictionary
      dictionary.set(key, value);
    }

    // return the dictionary object
    return dictionary;
  }

  /**
   * Writes Dictionary into buffer
   * @param buffer
   * @param data The data to parse for the 
   * @param resolver ReaderManager to write non-primitive types
   * @returns Buffer instance with the data in it
   */
  writeTo(
    buffer: BinaryWriter,
    content: Map<K, V>,
    resolver: ReaderManager,
  ): void {
    // write the amount of entries in the Dictionary
    UInt32Reader.writeTo(buffer, content.size);

    // loop over the entries
    for (const [key, value] of content.entries()) {
      // write the key
      if (this.key.isPolymorphic) resolver.writeIndex(buffer, this.key);
      this.key.writeTo(buffer, key, resolver);

      // write the value
      if (this.value.isPolymorphic) resolver.writeIndex(buffer, this.value);
      this.value.writeTo(buffer, value, resolver);
    }
  }

  export(value: Map<K, V>) {
    return Object.fromEntries(
      [...value.entries()].map(([key, value]) => {
        if (typeof key === "string") {
          return [key, value];
        } else if (typeof key === "number") {
          return [key.toString(), value];
        } else {
          throw new XnbError(
            `Cannot serialize ${this.key.type.name} to JSON key.`,
          );
        }
      }),
    );
  }

  import(value: Record<string, V>) {
    return new Map(
      Object.entries(value).map(([key, value]) => {
        if (isNumberType(this.key.type)) {
          return <[K, V]> <unknown> [
            isIntegerType(this.key.type) ? parseInt(key) : parseFloat(key),
            value,
          ];
        } else if (isStringType(this.key.type)) {
          return <[K, V]> <unknown> [key, value];
        } else {
          throw new XnbError(
            `Can't deserialise ${this.key.type.name} from JSON key.`,
          );
        }
      }),
    );
  }

  readonly isPolymorphic = true;

  readonly type = new Type({
    name: "Microsoft.Xna.Framework.Content.DictionaryReader",
    subtypes: [this.key.type, this.value.type],
  });

  static is(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Content.DictionaryReader";
  }

  static reads() {
    return false;
  }

  static fromType(type: Type) {
    const subtypes = type.subtypes.map((type) => getReader(type));
    return new DictionaryReader(
      subtypes[0],
      subtypes[1],
    );
  }
}

export default DictionaryReader;
