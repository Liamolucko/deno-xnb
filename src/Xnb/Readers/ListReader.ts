import BufferReader from "../../BufferReader.ts";
import BufferWriter from "../../BufferWriter.ts";
import ReaderResolver from "../ReaderResolver.ts";
import BaseReader from "./BaseReader.ts";
import UInt32Reader from "./UInt32Reader.ts";

/**
 * List Reader
 * @class
 * @extends BaseReader
 */
class ListReader extends BaseReader {
  reader: BaseReader;
  constructor(reader: BaseReader) {
    super();
    /** @type {BaseReader} */
    this.reader = reader;
  }

  /**
     * Reads List from buffer.
     * @param {BufferReader} buffer
     * @param {ReaderResolver} resolver
     * @returns {Array}
     */
  read(buffer: BufferReader, resolver: ReaderResolver): Array<any> {
    const uint32Reader = new UInt32Reader();
    const size = uint32Reader.read(buffer);

    const list = [];
    for (let i = 0; i < size; i++) {
      const value = this.reader.isValueType()
        ? this.reader.read(buffer)
        : resolver.read(buffer);
      list.push(value);
    }
    return list;
  }

  /**
     * Writes List into the buffer
     * @param {BufferWriter} buffer
     * @param {Mixed} data The data
     * @param {ReaderResolver} resolver
     */
  write(buffer: BufferWriter, content: any[], resolver?: ReaderResolver | null) {
    this.writeIndex(buffer, resolver);
    const uint32Reader = new UInt32Reader();
    uint32Reader.write(buffer, content.length, null);
    for (let i in content) {
      this.reader.write(
        buffer,
        content[i],
        (this.reader.isValueType() ? null : resolver),
      );
    }
  }

  get type() {
    return `List<${this.reader.type}>`;
  }
}

export default ListReader;
