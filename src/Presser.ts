import BufferReader from "./BufferReader.ts";
import Log from "./Log.ts";
import Lzx from "./Presser/Lzx.ts";
import XnbError from "./XnbError.ts";

/** 
 * Decompress a certain amount of bytes.
 * @param buffer The `BufferReader` from which to read.
 * @param compressedTodo The number of bytes to decompress.
 */
export function decompress(buffer: BufferReader, compressedTodo: number): Uint8Array {
  // current index into the buffer
  let pos = 0;

  // allocate variables for block and frame size
  let blockSize;
  let frameSize;

  // create the LZX instance with 16-bit window frame
  const lzx = new Lzx(16);

  // the full decompressed array
  let decompressed: number[] = [];

  // loop over the bytes left
  while (pos < compressedTodo) {
    // flag is for determining if frame_size is fixed or not
    const flag = buffer.readByte();

    // if flag is set to 0xFF that means we will read in frame size
    if (flag == 0xFF) {
      // read in the frame size
      frameSize = buffer.readLZXInt16();
      // read in the block size
      blockSize = buffer.readLZXInt16();
      // advance the byte position forward
      pos += 5;
    } else {
      // rewind the buffer
      buffer.seek(-1);
      // read in the block size
      blockSize = buffer.readLZXInt16();
      // set the frame size
      frameSize = 0x8000;
      // advance byte position forward
      pos += 2;
    }

    // ensure the block and frame size aren't empty
    if (blockSize == 0 || frameSize == 0) {
      break;
    }

    // ensure the block and frame size don't exceed size of integers
    if (blockSize > 0x10000 || frameSize > 0x10000) {
      throw new XnbError("Invalid size read in compression content.");
    }

    Log.debug(`Block Size: ${blockSize}, Frame Size: ${frameSize}`);

    // decompress the file based on frame and block size
    decompressed = decompressed.concat(
      lzx.decompress(buffer, frameSize, blockSize),
    );

    // increase position counter
    pos += blockSize;
  }

  // we have finished decompressing the file
  Log.info("File has been successfully decompressed!");

  // return a decompressed buffer
  return Uint8Array.from(decompressed);
}
