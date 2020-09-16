import { BinaryReader, BinaryWriter, Type } from "../mod.ts";
import Int32Reader from "./int32.ts";

const TBinReader = {
  readFrom(buffer: BinaryReader) {
    // read in the size of the data block
    let size = Int32Reader.readFrom(buffer);

    // return the data
    return buffer.readBytes(size);
  },

  writeTo(buffer: BinaryWriter, content: Uint8Array) {
    Int32Reader.writeTo(buffer, content.length);
    buffer.writeBytes(content);
  },

  type: new Type({ name: "xTile.Pipeline.TideReader" }),

  isPolymorphic: true,

  export(
    data: Uint8Array,
    exportFile: (data: Uint8Array, extension: string) => string,
  ) {
    return exportFile(data, "tbin");
  },

  import(filename: string, importFile: (filename: string) => Uint8Array) {
    return importFile(filename);
  },

  is(type: Type) {
    return type.name === "xTile.Pipeline.TideReader";
  },

  reads() {
    return false;
  },

  fromType() {
    return this;
  },
};

export default TBinReader;
