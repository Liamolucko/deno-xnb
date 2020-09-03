import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import Int32Reader from "./int32.ts";

export interface TBin {
  type: "TBin";
  data: Uint8Array;
}

export default {
  read(buffer: BufferReader): { export: TBin } {
    // read in the size of the data block
    let size = Int32Reader.read(buffer);
    // read in the data block
    let data = buffer.read(size);

    // return the data
    return { export: { type: "TBin", data } };
  },

  write(
    buffer: BufferWriter,
    content: TBin,
    resolver?: ReaderResolver | null,
  ) {
    resolver?.writeIndex(buffer, this);
    Int32Reader.write(buffer, content.data.length, null);
    buffer.concat(content.data);
  },

  get type() {
    return "TBin";
  },

  get primitive() {
    return false;
  },
};
