import { BinaryReader, BinaryWriter, Type } from "../mod.ts";

const StringReader = {
  /** Reads String from buffer. */
  readFrom(buffer: BinaryReader): string {
    // Read in the length of the string
    const length = buffer.read7BitEncodedNumber();
    // Read in the UTF-8 encoded string
    return new TextDecoder().decode(buffer.readBytes(length));
  },

  /** Writes the string to the buffer. */
  writeTo(buffer: BinaryWriter, string: string) {
    // Convert the string to bytes
    const charBuf = new TextEncoder().encode(string);
    // Write the length of the string
    buffer.write7BitEncodedNumber(charBuf.length);
    // Write the string
    buffer.writeBytes(charBuf);
  },

  type: new Type({ name: "Microsoft.Xna.Framework.Content.StringReader" }),

  isPolymorphic: true,

  is(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Content.StringReader";
  },

  reads(type: Type) {
    return type.name === "System.String";
  },

  fromType() {
    return this;
  },
};

export default StringReader;
