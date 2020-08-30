import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import BaseReader from "./base.ts";
import UInt32Reader from "./uint32.ts";

export interface Effect {
  type: "Effect";
  data: Uint8Array;
}

/** Effect Reader */
class EffectReader extends BaseReader {
  read(buffer: BufferReader): { export: Effect } {
    const uint32Reader = new UInt32Reader();

    const size = uint32Reader.read(buffer);
    const bytecode = buffer.read(size);

    return { export: { type: 'Effect', data: bytecode } };
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
