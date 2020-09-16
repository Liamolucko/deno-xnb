import { BinaryReader, BinaryWriter, Type } from "../mod.ts";
import UInt32Reader from "./uint32.ts";

const EffectReader = {
  readFrom(buffer: BinaryReader): Uint8Array {
    const size = UInt32Reader.readFrom(buffer);
    return buffer.readBytes(size);
  },

  /** Writes Effects into the buffer */
  writeTo(buffer: BinaryWriter, content: Uint8Array) {
    UInt32Reader.writeTo(buffer, content.length);
    buffer.writeBytes(content);
  },

  isPolymorphic: true,

  type: new Type({ name: "Microsoft.Xna.Framework.Content.EffectReader" }),

  export(
    data: Uint8Array,
    exportFile: (data: Uint8Array, extension: string) => string,
  ) {
    return exportFile(data, "cso");
  },

  import(filename: string, importFile: (filename: string) => Uint8Array) {
    return importFile(filename);
  },

  is(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Content.EffectReader";
  },

  reads(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Graphics.Effect";
  },

  fromType() {
    return this;
  },
};

export default EffectReader;
