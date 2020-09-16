import { Type, BinaryReader, BinaryWriter } from "../mod.ts";

const DoubleReader = {
  /** Reads Double from buffer. */
  readFrom(buffer: BinaryReader): number {
    return buffer.readFloat64(true);
  },

  /** Writes Double into buffer */
  writeTo(buffer: BinaryWriter, content: number) {
    buffer.writeFloat64(content, true);
  },

  isPolymorphic: false,

  type: new Type({ name: "Microsoft.Xna.Framework.Content.DoubleReader" }),

  is(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Content.DoubleReader";
  },

  reads(type: Type) {
    return type.name === "System.Double";
  },

  fromType() {
    return this;
  },
};

export default DoubleReader;
