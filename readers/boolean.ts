import { BinaryReader, BinaryWriter, Type } from "../mod.ts";

const BooleanReader = {
  /** Reads Boolean from buffer. */
  readFrom(buffer: BinaryReader): boolean {
    return Boolean(buffer.readByte());
  },

  /** Writes Boolean into buffer */
  writeTo(buffer: BinaryWriter, content: boolean) {
    buffer.writeByte(Number(content));
  },

  isPolymorphic: false,

  type: new Type({ name: "Microsoft.Xna.Framework.Content.BooleanReader" }),

  is(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Content.BooleanReader";
  },

  reads(type: Type) {
    return type.name === "System.Boolean";
  },

  fromType() {
    return this;
  },
};

export default BooleanReader;
