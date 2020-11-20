import { SingletonReader, Type } from "../src/types.ts";
import CharReader from "./char.ts";
import Int32Reader from "./int32.ts";
import ListReader from "./list.ts";
import NullableReader from "./nullable.ts";
import RectangleReader, { Rectangle } from "./rectangle.ts";
import SingleReader from "./single.ts";
import Texture2DReader, { Texture2D, Texture2DExport } from "./texture2d.ts";
import { Vector3, Vector3Reader } from "./vector3.ts";
import { BinaryReader, BinaryWriter, ReaderManager } from "../mod.ts";

interface BaseSpriteFont {
  glyphs: Rectangle[];
  cropping: Rectangle[];
  characterMap: string[];
  verticalLineSpacing: number;
  horizontalSpacing: number;
  kerning: Vector3[];
  defaultCharacter: string | null;
}

export interface SpriteFont extends BaseSpriteFont {
  texture: Texture2D;
}

export interface SpriteFontExport extends BaseSpriteFont {
  texture: Texture2DExport;
}

const SpriteFontReader = <SingletonReader<SpriteFont, SpriteFontExport>> {
  /** Reads SpriteFont from buffer. */
  readFrom(buffer: BinaryReader, resolver: ReaderManager): SpriteFont {
    const nullableCharReader = new NullableReader(CharReader);
    const rectangleListReader = new ListReader(RectangleReader);
    const charListReader = new ListReader(CharReader);
    const vector3ListReader = new ListReader(Vector3Reader);

    const texture = resolver.readFrom(buffer, Texture2DReader);
    const glyphs = resolver.readFrom(buffer, rectangleListReader);
    const cropping = resolver.readFrom(buffer, rectangleListReader);
    const characterMap = resolver.readFrom(buffer, charListReader);
    const verticalLineSpacing = Int32Reader.readFrom(buffer);
    const horizontalSpacing = SingleReader.readFrom(buffer);
    const kerning = resolver.readFrom(buffer, vector3ListReader);
    const defaultCharacter = nullableCharReader.readFrom(buffer, resolver);

    return {
      texture,
      glyphs,
      cropping,
      characterMap,
      verticalLineSpacing,
      horizontalSpacing,
      kerning,
      defaultCharacter,
    };
  },

  writeTo(
    buffer: BinaryWriter,
    content: SpriteFont,
    resolver: ReaderManager,
  ) {
    const nullableCharReader = new NullableReader(CharReader);
    const rectangleListReader = new ListReader(RectangleReader);
    const charListReader = new ListReader(CharReader);
    const vector3ListReader = new ListReader(Vector3Reader);

    try {
      resolver.writeIndex(buffer, Texture2DReader);
      Texture2DReader.writeTo(buffer, content.texture, resolver);
      resolver.writeIndex(buffer, rectangleListReader);
      rectangleListReader.writeTo(buffer, content.glyphs, resolver);
      resolver.writeIndex(buffer, rectangleListReader);
      rectangleListReader.writeTo(buffer, content.cropping, resolver);
      resolver.writeIndex(buffer, charListReader);
      charListReader.writeTo(buffer, content.characterMap, resolver);
      Int32Reader.writeTo(buffer, content.verticalLineSpacing);
      SingleReader.writeTo(buffer, content.horizontalSpacing);
      resolver.writeIndex(buffer, vector3ListReader);
      vector3ListReader.writeTo(buffer, content.kerning, resolver);
      nullableCharReader.writeTo(buffer, content.defaultCharacter, resolver);
    } catch (ex) {
      throw ex;
    }
  },

  type: new Type({ name: "Microsoft.Xna.Framework.Content.SpriteFontReader" }),

  isPolymorphic: true,

  export(value, exportFile) {
    const texture = Texture2DReader.export(value.texture, exportFile);
    return {
      ...value,
      texture,
    };
  },

  import(value, importFile) {
    return {
      ...value,
      texture: Texture2DReader.import(value.texture, importFile),
    };
  },

  is(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Content.SpriteFontReader";
  },

  reads(type: Type) {
    return type.name === "Microsoft.Xna.Framework.Graphics.SpriteFont";
  },

  fromType() {
    return this;
  },
};

export default SpriteFontReader;
