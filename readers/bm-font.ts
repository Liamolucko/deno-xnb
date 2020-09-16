import { BinaryReader, BinaryWriter, Type } from "../mod.ts";
import StringReader from "./string.ts";

const BmFontReader = {
  /** Reads BmFont from buffer. */
  readFrom(stream: BinaryReader): string {
    return StringReader.readFrom(stream);
  },

  /** Writes BmFont into buffer. */
  writeTo(stream: BinaryWriter, content: string) {
    StringReader.writeTo(stream, content);
  },

  isPolymorphic: true,

  type: new Type({ name: "BmFont.XmlSourceReader" }),

  import(filename: string, importFile: (filename: string) => Uint8Array) {
    return new TextDecoder().decode(importFile(filename));
  },

  export(
    xml: string,
    exportFile: (data: Uint8Array, extension: string) => string,
  ) {
    return exportFile(new TextEncoder().encode(xml), "xml");
  },

  is(type: Type) {
    return type.name === "BmFont.XmlSourceReader";
  },

  reads() {
    return false; // TODO: Find out if there's a type name I should check here
  },

  fromType() {
    return this;
  },
};

export default BmFontReader;
