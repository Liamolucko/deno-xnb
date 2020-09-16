import { BinaryReader, BinaryWriter, Type } from "../mod.ts";
import SingleReader from "./single.ts";

export interface Vector4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

const Vector4Reader = {
  /** Reads Vector4 from buffer. */
  readFrom(buffer: BinaryReader): Vector4 {
    let x = SingleReader.readFrom(buffer);
    let y = SingleReader.readFrom(buffer);
    let z = SingleReader.readFrom(buffer);
    let w = SingleReader.readFrom(buffer);

    return { x, y, z, w };
  },

  writeTo(buffer: BinaryWriter, content: Vector4) {
    SingleReader.writeTo(buffer, content.x);
    SingleReader.writeTo(buffer, content.y);
    SingleReader.writeTo(buffer, content.z);
    SingleReader.writeTo(buffer, content.w);
  },

  type: new Type({ name: "Microsoft.Xna.Framework.Content.Vector4Reader" }),

  isPolymorphic: false,

  is(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Content.Vector4Reader";
  },

  reads(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Vector4";
  },

  fromType() {
    return this;
  },
};

export default Vector4Reader;
