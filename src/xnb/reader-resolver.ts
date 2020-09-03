import { BufferReader, BufferWriter } from "../buffers.ts";
import XnbError from "../error.ts";
import { Reader } from "./readers.ts";

/** Class used to read the XNB types using the readers */
class ReaderResolver {
  /**
   * Creating a new instance of ReaderResolver
   * @param readers Array of BaseReaders
   */
  constructor(private readers: Reader[]) {}

  /**
   * Read the XNB file contents
   * @param buffer The buffer to read from.
   */
  read(buffer: BufferReader) {
    // read the index of which reader to use
    let index = buffer.read7BitNumber() - 1;
    if (this.readers[index] == null) {
      throw new XnbError(`Invalid reader index ${index}`);
    }
    // read the buffer using the selected reader
    return this.readers[index].read(buffer, this);
  }

  /**
   * Writes the XNB file contents
   * @param buffer
   * @param content 
   */
  write(buffer: BufferWriter, content: any) {
    this.readers[0].write(buffer, content, this);
  }

  /**
   * Returns the index of the reader
   * @param reader
   */
  getIndex(reader: Reader) {
    return this.readers.findIndex((el) => reader.type === el.type);
  }

  writeIndex(
    buffer: BufferWriter,
    reader: Reader,
  ) {
    buffer.write7BitNumber(this.getIndex(reader) + 1);
  }
}

export default ReaderResolver;
