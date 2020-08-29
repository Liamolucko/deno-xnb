import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import BaseReader from "./base.ts";
import Int32Reader from "./int32.ts";

/** TBin Reader */
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
