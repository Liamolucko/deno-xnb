import { BinaryReader, BinaryWriter, Type } from "../mod.ts";
import SingleReader from "./single.ts";

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export const Vector3Reader = {
  /** Reads Vector3 from buffer. */
  readFrom(buffer: BinaryReader): Vector3 {
    let x = SingleReader.readFrom(buffer);
    let y = SingleReader.readFrom(buffer);
    let z = SingleReader.readFrom(buffer);

    return { x, y, z };
  },

  writeTo(buffer: BinaryWriter, content: Vector3) {
    SingleReader.writeTo(buffer, content.x);
    SingleReader.writeTo(buffer, content.y);
    SingleReader.writeTo(buffer, content.z);
  },

  type: new Type({ name: "Microsoft.Xna.Framework.Content.Vector3Reader" }),

  isPolymorphic: false,

  is(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Content.Vector3Reader";
  },

  reads(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Vector3";
  },

  fromType() {
    return this;
  },
};

export default Vector3Reader;
