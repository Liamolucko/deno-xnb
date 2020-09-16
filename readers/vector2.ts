import { BinaryReader, BinaryWriter, Type } from "../mod.ts";
import SingleReader from "./single.ts";

export interface Vector2 {
  x: number;
  y: number;
}

const Vector2Reader = {
  /** Reads Vector2 from buffer. */
  readFrom(buffer: BinaryReader): Vector2 {
    let x = SingleReader.readFrom(buffer);
    let y = SingleReader.readFrom(buffer);

    return { x, y };
  },

  writeTo(buffer: BinaryWriter, content: Vector2) {
    SingleReader.writeTo(buffer, content.x);
    SingleReader.writeTo(buffer, content.y);
  },

  type: new Type({ name: "Microsoft.Xna.Framework.Content.Vector2Reader" }),

  isPolymorphic: false,

  is(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Content.Vector2Reader";
  },

  reads(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Vector2";
  },

  fromType() {
    return this;
  },
};

export default Vector2Reader;
