import { BufferReader, BufferWriter } from "../../buffers.ts";
import ReaderResolver from "../reader-resolver.ts";
import CharReader from "./char.ts";
import Int32Reader from "./int32.ts";
import ListReader from "./list.ts";
import NullableReader from "./nullable.ts";
import RectangleReader, { Rectangle } from "./rectangle.ts";
import SingleReader from "./single.ts";
import Texture2DReader from "./texture2d.ts";
import Vector3Reader from "./vector3.ts";

// TODO
type Texture2D = any;
type Vector3 = any;

export interface SpriteFont {
  texture: Texture2D;
  glyphs: Rectangle[];
  cropping: Rectangle[];
  characterMap: string[];
  verticalLineSpacing: number;
  horizontalSpacing: number;
  kerning: Vector3[];
  defaultCharacter: string | null;
}

export default {
  /** Reads SpriteFont from buffer. */
  read(buffer: BufferReader, resolver: ReaderResolver): SpriteFont {
    const nullableCharReader = new NullableReader(CharReader);

    const texture = resolver.read(buffer);
    const glyphs = resolver.read(buffer);
    const cropping = resolver.read(buffer);
    const characterMap = resolver.read(buffer);
    const verticalLineSpacing = Int32Reader.read(buffer);
    const horizontalSpacing = SingleReader.read(buffer);
    const kerning = resolver.read(buffer);
    const defaultCharacter = nullableCharReader.read(buffer);

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

  write(
    buffer: BufferWriter,
    content: SpriteFont,
    resolver?: ReaderResolver | null,
  ) {
    const nullableCharReader = new NullableReader(CharReader);
    const rectangleListReader = new ListReader(RectangleReader);
    const charListReader = new ListReader(CharReader);
    const vector3ListReader = new ListReader(Vector3Reader);

    resolver?.writeIndex(buffer, this);

    try {
      Texture2DReader.write(buffer, content.texture, resolver);
      rectangleListReader.write(buffer, content.glyphs, resolver);
      rectangleListReader.write(buffer, content.cropping, resolver);
      charListReader.write(buffer, content.characterMap, resolver);
      Int32Reader.write(buffer, content.verticalLineSpacing, null);
      SingleReader.write(buffer, content.horizontalSpacing, null);
      vector3ListReader.write(buffer, content.kerning, resolver);
      nullableCharReader.write(buffer, content.defaultCharacter, null);
    } catch (ex) {
      throw ex;
    }
  },

  get type() {
    return "SpriteFont";
  },

  get primitive() {
    return false;
  },
};
