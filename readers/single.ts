import { BinaryReader, BinaryWriter, Type } from "../mod.ts";

const SingleReader = {
  /** Reads Single from the buffer. */
  readFrom(buffer: BinaryReader): number {
    return buffer.readFloat32(true);
  },

  writeTo(buffer: BinaryWriter, content: number) {
    buffer.writeFloat32(content, true);
  },

  type: new Type({ name: "Microsoft.Xna.Framework.Content.SingleReader" }),

  isPolymorphic: false,

  is(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Content.SingleReader";
  },

  reads(type: Type) {
    return type.name === "System.Single";
  },

  fromType() {
    return this;
  },
};

export default SingleReader;
