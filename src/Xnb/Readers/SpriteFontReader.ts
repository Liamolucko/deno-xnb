import BufferReader from "../../BufferReader.ts";
import BufferWriter from "../../BufferWriter.ts";
import ReaderResolver from "../ReaderResolver.ts";
import BaseReader from "./BaseReader.ts";
import CharReader from "./CharReader.ts";
import Int32Reader from "./Int32Reader.ts";
import ListReader from "./ListReader.ts";
import NullableReader from "./NullableReader.ts";
import RectangleReader from "./RectangleReader.ts";
import SingleReader from "./SingleReader.ts";
import Texture2DReader from "./Texture2DReader.js";
import Vector3Reader from "./Vector3Reader.ts";

/**
 * SpriteFont Reader
 * @class
 * @extends BaseReader
 */
class SpriteFontReader extends BaseReader {
  /**
     * Reads SpriteFont from buffer.
     * @param {BufferReader} buffer
     * @param {ReaderResolver} resolver
     * @returns {object}
     */
  read(buffer: BufferReader, resolver: ReaderResolver) {
    const int32Reader = new Int32Reader();
    const singleReader = new SingleReader();
    const nullableCharReader = new NullableReader(new CharReader());

    const texture = resolver.read(buffer);
    const glyphs = resolver.read(buffer);
    const cropping = resolver.read(buffer);
    const characterMap = resolver.read(buffer);
    const verticalLineSpacing = int32Reader.read(buffer);
    const horizontalSpacing = singleReader.read(buffer);
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
  }

  write(buffer: BufferWriter, content: {
    texture: unknown;
    glyphs: any[];
    cropping: any[];
    characterMap: any[];
    verticalLineSpacing: number;
    horizontalSpacing: number;
    kerning: any[];
    defaultCharacter: any;
  }, resolver?: ReaderResolver | null) {
    const int32Reader = new Int32Reader();
    const charReader = new CharReader();
    const singleReader = new SingleReader();
    const nullableCharReader = new NullableReader(charReader);
    const texture2DReader = new Texture2DReader();
    const rectangleListReader = new ListReader(new RectangleReader());
    const charListReader = new ListReader(charReader);
    const vector3ListReader = new ListReader(new Vector3Reader());

    this.writeIndex(buffer, resolver);

    try {
      texture2DReader.write(buffer, content.texture, resolver);
      rectangleListReader.write(buffer, content.glyphs, resolver);
      rectangleListReader.write(buffer, content.cropping, resolver);
      charListReader.write(buffer, content.characterMap, resolver);
      int32Reader.write(buffer, content.verticalLineSpacing, null);
      singleReader.write(buffer, content.horizontalSpacing, null);
      vector3ListReader.write(buffer, content.kerning, resolver);
      nullableCharReader.write(buffer, content.defaultCharacter, null);
    } catch (ex) {
      throw ex;
    }
  }

  isValueType() {
    return false;
  }
}

export default SpriteFontReader;
