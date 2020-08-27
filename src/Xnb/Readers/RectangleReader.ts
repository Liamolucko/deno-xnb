import BaseReader from "./BaseReader.ts";
import BufferReader from "../../BufferReader.ts";
import Int32Reader from "./Int32Reader.ts";
import BufferWriter from "../../BufferWriter.ts";
import ReaderResolver from "../ReaderResolver.ts";

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Rectangle Reader */
class RectangleReader extends BaseReader<Rectangle> {
  /** Reads Rectangle from buffer. */
  read(buffer: BufferReader): Rectangle {
    const int32Reader = new Int32Reader();

    const x = int32Reader.read(buffer);
    const y = int32Reader.read(buffer);
    const width = int32Reader.read(buffer);
    const height = int32Reader.read(buffer);

    return { x, y, width, height };
  }

  /**
   * Writes Effects into the buffer
   * @param buffer
   * @param data The data
   * @param resolver
   */
  write(
    buffer: BufferWriter,
    content: Rectangle,
    resolver: ReaderResolver,
  ) {
    this.writeIndex(buffer, resolver);
    const int32Reader = new Int32Reader();
    int32Reader.write(buffer, content.x, null);
    int32Reader.write(buffer, content.y, null);
    int32Reader.write(buffer, content.width, null);
    int32Reader.write(buffer, content.height, null);
  }
}

export default RectangleReader;
