import { BinaryReader, BinaryWriter, Type, XnbError } from "../mod.ts";

/** Gets size of char for some special characters that are more than one byte. */
function getCharSize(byte: number): number {
  return ((0xE5000000 >> ((byte >> 3) & 0x1e)) & 3) + 1;
}

const CharReader = {
  /** Reads Char from the buffer. */
  readFrom(buffer: BinaryReader): string {
    let charSize = getCharSize(buffer.peekByte());
    return new TextDecoder().decode(buffer.readBytes(charSize));
  },

  /** Writes Char into buffer */
  writeTo(buffer: BinaryWriter, content: string) {
    if (content.length > 1) {
      throw new XnbError("CharReader can only write single characters");
    }
    buffer.writeBytes(new TextEncoder().encode(content));
  },

  isPolymorphic: false,

  type: new Type({ name: "Microsoft.Xna.Framework.Content.CharReader" }),

  is(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Content.CharReader";
  },

  reads(type: Type) {
    return type.name === "System.Char";
  },

  fromType() {
    return this;
  },
};

export default CharReader;
