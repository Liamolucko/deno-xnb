import BaseReader from "./BaseReader.ts";
import BufferReader from "../../BufferReader.ts";
import BufferWriter from "../../BufferWriter.ts";
import Int32Reader from "./Int32Reader.ts";
import ReaderResolver from "../ReaderResolver.ts";

/**
 * TBin Reader
 * @class
 * @extends BaseReader
 */
class TBinReader extends BaseReader {
  read(buffer: BufferReader) {
    const int32Reader = new Int32Reader();

    // read in the size of the data block
    let size = int32Reader.read(buffer);
    // read in the data block
    let data = buffer.read(size);

    // return the data
    return { export: { type: this.type, data } };
  }

  write(
    buffer: BufferWriter,
    content: { data: Uint8Array },
    resolver?: ReaderResolver | null,
  ) {
    this.writeIndex(buffer, resolver);
    const int32Reader = new Int32Reader();
    int32Reader.write(buffer, content.data.length, null);
    buffer.concat(content.data);
  }

  isValueType() {
    return false;
  }
}

export default TBinReader;
