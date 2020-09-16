import { BinaryReader, BinaryWriter, Type } from "../mod.ts";
import Int32Reader from "./int32.ts";

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

const RectangleReader = {
  /** Reads Rectangle from buffer. */
  readFrom(buffer: BinaryReader): Rectangle {
    const x = Int32Reader.readFrom(buffer);
    const y = Int32Reader.readFrom(buffer);
    const width = Int32Reader.readFrom(buffer);
    const height = Int32Reader.readFrom(buffer);

    return { x, y, width, height };
  },

  /**
   * Writes Effects into the buffer
   * @param buffer
   * @param data The data
   * @param resolver
   */
  writeTo(buffer: BinaryWriter, content: Rectangle) {
    Int32Reader.writeTo(buffer, content.x);
    Int32Reader.writeTo(buffer, content.y);
    Int32Reader.writeTo(buffer, content.width);
    Int32Reader.writeTo(buffer, content.height);
  },

  type: new Type({ name: "Microsoft.Xna.Framework.Content.RectangleReader" }),

  isPolymorphic: false,

  is(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Content.RectangleReader";
  },

  reads(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Rectangle";
  },

  fromType() {
    return this;
  },
};

export default RectangleReader;
