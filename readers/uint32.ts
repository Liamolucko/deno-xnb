import { BinaryReader, BinaryWriter, Type } from "../mod.ts";

const UInt32Reader = {
  /** Reads UInt32 from buffer. */
  readFrom(buffer: BinaryReader): number {
    return buffer.readUint32(true);
  },

  writeTo(buffer: BinaryWriter, content: number) {
    buffer.writeUint32(content, true);
  },

  type: new Type({ name: "Microsoft.Xna.Framework.Content.UInt32Reader" }),

  isPolymorphic: false,

  is(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Content.UInt32Reader";
  },

  reads(type: Type) {
    return type.name === "System.UInt32";
  },

  fromType() {
    return this;
  },
};

export default UInt32Reader;
