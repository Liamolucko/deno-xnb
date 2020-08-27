import BaseReader from "./BaseReader.ts";
import BufferReader from "../../BufferReader.ts";
import BufferWriter from "../../BufferWriter.ts";
import UInt32Reader from "./UInt32Reader.ts";
import ReaderResolver from "../ReaderResolver.ts";

/** Effect Reader */
class EffectReader extends BaseReader {
  read(buffer: BufferReader) {
    const uint32Reader = new UInt32Reader();

    const size = uint32Reader.read(buffer);
    const bytecode = buffer.read(size);

    return { export: { type: this.type, data: bytecode } };
  }

  /**
   * Writes Effects into the buffer
   * @param buffer
   * @param data The data
   * @param resolver
   */
  write(
    buffer: BufferWriter,
    content: { data: Uint8Array },
    resolver: ReaderResolver,
  ) {
    this.writeIndex(buffer, resolver);

    const uint32Reader = new UInt32Reader();

    uint32Reader.write(buffer, content.data.length, null);
    buffer.concat(content.data);
  }

  isValueType() {
    return false;
  }
}

export default EffectReader;
