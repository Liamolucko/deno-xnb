import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import { Reader } from "../readers.ts";
import UInt32Reader from "./uint32.ts";

/** Dictionary Reader */
class DictionaryReader<T> implements Reader<Record<string, T>> {
  /**
     * Constructor for DictionaryReader.
     * @constructor
     * @param key The BaseReader for the dictionary key.
     * @param value The BaseReader for the dictionary value.
     */
  constructor(private key: Reader<string>, private value: Reader<T>) {}

  /**
   * Reads Dictionary from buffer.
   * @param buffer Buffer to read from.
   * @param resolver ReaderResolver to read non-primitive types. 
   */
  read(buffer: BufferReader, resolver: ReaderResolver): Record<string, T> {
    // the dictionary to return
    let dictionary: Record<string, T> = {};

    // read in the size of the dictionary
    const size = UInt32Reader.read(buffer);

    // loop over the size of the dictionary and read in the data
    for (let i = 0; i < size; i++) {
      // get the key
      let key = this.key.primitive
        ? this.key.read(buffer)
        : resolver.read(buffer);
      // get the value
      let value = this.value.primitive
        ? this.value.read(buffer)
        : resolver.read(buffer);

      // assign KV pair to the dictionary
      dictionary[key] = value;
    }

    // return the dictionary object
    return dictionary;
  }

  /**
   * Writes Dictionary into buffer
   * @param buffer
   * @param data The data to parse for the 
   * @param resolver ReaderResolver to write non-primitive types
   * @returns Buffer instance with the data in it
   */
  write(
    buffer: BufferWriter,
    content: Record<string, T>,
    resolver: ReaderResolver,
  ): void {
    // write the index
    resolver?.writeIndex(buffer, this);

    // write the amount of entries in the Dictionary
    buffer.writeUInt32(Object.keys(content).length);

    // loop over the entries
    for (let key of Object.keys(content)) {
      // write the key
      this.key.write(buffer, key, (this.key.primitive ? null : resolver));
      // write the value
      this.value.write(
        buffer,
        content[key],
        (this.value.primitive ? null : resolver),
      );
    }
  }

  get type() {
    return `Dictionary<${this.key.type},${this.value.type}>`;
  }

  get primitive() {
    return false;
  }
}

export default DictionaryReader;
