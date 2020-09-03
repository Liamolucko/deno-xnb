import { BufferReader, BufferWriter } from "../buffers.ts";
import ReaderResolver from "./reader-resolver.ts";
import BmFontReader from "./readers/bm-font.ts";
import BooleanReader from "./readers/boolean.ts";
import CharReader from "./readers/char.ts";
import DoubleReader from "./readers/double.ts";
import EffectReader from "./readers/effect.ts";
import Int32Reader from "./readers/int32.ts";
import RectangleReader from "./readers/rectangle.ts";
import SingleReader from "./readers/single.ts";
import SpriteFontReader from "./readers/sprite-font.ts";
import StringReader from "./readers/string.ts";
import TBinReader from "./readers/tbin.ts";
import Texture2DReader from "./readers/texture2d.ts";
import UInt32Reader from "./readers/uint32.ts";
import Vector2Reader from "./readers/vector2.ts";
import Vector3Reader from "./readers/vector3.ts";
import Vector4Reader from "./readers/vector4.ts";

export const readers = new Map(Object.entries({
  BmFontReader,
  BooleanReader,
  CharReader,
  DoubleReader,
  EffectReader,
  Int32Reader,
  RectangleReader,
  SingleReader,
  SpriteFontReader,
  StringReader,
  TBinReader,
  Texture2DReader,
  UInt32Reader,
  Vector2Reader,
  Vector3Reader,
  Vector4Reader,
}));

export interface Reader<T = any> {
  /** Whether type is primitive. */
  primitive: boolean;

  /** String type of reader. */
  type: string;

  /**
   * Reads the buffer by the specification of the type reader.
   * @public
   * @param buffer The buffer to read from.
   * @param resolver The content reader to resolve readers from.
   * @returns The type as specified by the type reader.
   */
  read(buffer: BufferReader, resolver?: ReaderResolver | null): T;

  /**
   * Writes into the buffer
   * @param buffer The buffer to write to
   * @param data The data to parse to write to the buffer
   * @param resolver ReaderResolver to write non-primitive types
   */
  write(
    buffer: BufferWriter,
    content: T,
    resolver?: ReaderResolver | null,
  ): void;
}
