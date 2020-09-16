import { BinaryReader, BinaryWriter, Type } from "../mod.ts";

const Int32Reader = {
  /** Reads Int32 from buffer. */
  readFrom(buffer: BinaryReader): number {
    return buffer.readInt32(true);
  },

  /** Writes Int32 to buffer. */
  writeTo(buffer: BinaryWriter, content: number) {
    buffer.writeInt32(content, true);
  },

  isPolymorphic: false,

  type: new Type({ name: "Microsoft.Xna.Framework.Content.Int32Reader" }),

  is(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Content.Int32Reader";
  },

  reads(type: Type) {
    return type.name === "System.Int32";
  },

  fromType() {
    return this;
  },
};

export default Int32Reader;
