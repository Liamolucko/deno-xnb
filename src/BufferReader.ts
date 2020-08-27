import {
  bgBlue,
  bgMagenta,
  black,
  gray
} from "https://deno.land/std@0.66.0/fmt/colors.ts";
import XnbError from "./XnbError.ts";

const LITTLE_ENDIAN = 0;
const BIG_ENDIAN = 1;

class BufferReader {
  /** The internal buffer for the reader */
  #buffer: Uint8Array;
  #data: DataView;
  /** Seek index for the internal buffer. */
  #offset: number;
  /** Bit offset for bit reading. */
  #bitOffset: number;
  /** Last debug location for logging byte locations */
  #lastDebugLoc: number;
  /** The endianness of the buffer stream */
  #endianus: number;

  /**
   * Creates instance of Reader class.
   * @param buffer The buffer to read with the reader.
   */
  constructor(buffer: Uint8Array, endianus = LITTLE_ENDIAN) {
    this.#endianus = endianus;

    this.#buffer = buffer;
    this.#data = new DataView(this.buffer.buffer);

    this.#offset = 0;

    this.#bitOffset = 0;

    this.#lastDebugLoc = 0;
  }

  /**
   * Seeks to a specific index in the buffer.
   * @param index Sets the buffer seek index.
   * @param origin Location to seek from
   */
  seek(index: number, origin: number = this.#offset) {
    const offset = this.#offset;
    this.#offset = Math.max(origin + index, 0);
    if (this.#offset < 0 || this.#offset > this.buffer.length) {
      throw new XnbError(
        `Buffer seek out of bounds! ${this.#offset} ${this.buffer.length}`,
      );
    }
    return this.#offset - offset;
  }

  /** The seek index of the buffer. */
  get bytePosition(): number {
    return this.#offset;
  }

  set bytePosition(value: number) {
    this.#offset = value;
  }

  /** The current position for bit reading. */
  get bitPosition(): number {
    return this.#bitOffset;
  }

  set bitPosition(offset: number) {
    // when rewinding, reset it back to
    if (offset < 0) offset = 16 - offset;
    // set the offset and clamp to 16-bit frame
    this.#bitOffset = offset % 16;
    // get byte seek for bit ranges that wrap past 16-bit frames
    const byteSeek = ((offset - (Math.abs(offset) % 16)) / 16) * 2;
    // seek ahead for overflow on 16-bit frames
    this.seek(byteSeek);
  }

  /** The buffer size. */
  get size(): number {
    return this.buffer.length;
  }

  /** The buffer being read. */
  get buffer(): Uint8Array {
    return this.#buffer;
  }

  /** Writes another buffer into this buffer. */
  copyFrom(
    buffer: Uint8Array,
    targetIndex: number = 0,
    sourceIndex: number = 0,
    length: number = buffer.length,
  ) {
    // we need to resize the buffer to fit the contents
    if (this.buffer.length < length + targetIndex) {
      // create a temporary buffer of the new size
      const tempBuffer = new Uint8Array(
        this.buffer.length + (length + targetIndex - this.buffer.length),
      );
      // copy our buffer into the temp buffer
      tempBuffer.set(this.buffer);
      // copy the buffer given into the temp buffer
      tempBuffer.set(buffer.slice(sourceIndex, length), targetIndex);
      // assign our buffer to the temporary buffer
      this.#buffer = tempBuffer;
      this.#data = new DataView(this.buffer.buffer);
    } else {
      // copy the buffer into our buffer
      this.buffer.set(buffer.slice(sourceIndex, length), targetIndex);
    }
  }

  /**
   * Reads a specific number of bytes.
   * @param count Number of bytes to read.
   * @returns Contents of the buffer.
   */
  read(count: number): Uint8Array {
    // read from the buffer
    const buffer = this.buffer.slice(this.#offset, this.#offset + count);
    // advance seek offset
    this.seek(count);
    // debug this read
    //if (this._debug_mode) this.debug();
    // return the read buffer
    return buffer;
  }

  /**
     * Reads a single byte
     * @public
     * @returns
     */
  readByte(): number {
    return this.readUInt();
  }

  /**
     * Reads an int8
     * @public
     * @returns
     */
  readInt(): number {
    const out = this.peekInt();
    this.seek(1);
    return out;
  }

  /**
     * Reads an uint8
     * @public
     * @returns
     */
  readUInt(): number {
    const out = this.peekUInt();
    this.seek(1);
    return out;
  }

  /**
     * Reads a uint16
     * @public
     * @returns
     */
  readUInt16(): number {
    const out = this.peekUInt16();
    this.seek(2);
    return out;
  }

  /**
     * Reads a uint32
     * @public
     * @returns
     */
  readUInt32(): number {
    const out = this.peekUInt32();
    this.seek(4);
    return out;
  }

  /**
     * Reads an int16
     * @public
     * @returns
     */
  readInt16(): number {
    const out = this.peekInt16();
    this.seek(2);
    return out;
  }

  /**
     * Reads an int32
     * @public
     * @returns
     */
  readInt32(): number {
    const out = this.peekInt32();
    this.seek(4);
    return out;
  }

  /**
     * Reads a float
     * @public
     * @returns
     */
  readSingle(): number {
    const out = this.peekSingle();
    this.seek(4);
    return out;
  }

  /**
     * Reads a double
     * @public
     * @returns
     */
  readDouble(): number {
    const out = this.peekDouble();
    this.seek(4);
    return out;
  }

  /**
     * Reads a string
     * @public
     * @param [count]
     * @returns
     */
  readString(count: number = 0): string {
    if (count === 0) {
      const chars = [];
      while (this.peekByte() != 0x0) {
        chars.push(this.readString(1));
      }
      this.seek(1);
      return chars.join("");
    }
    return new TextDecoder().decode(this.read(count));
  }

  /** Peeks ahead in the buffer without actually seeking ahead. */
  peek(count: number): Uint8Array {
    // read from the buffer
    const buffer = this.read(count);
    // rewind the buffer
    this.seek(-count);
    // return the buffer
    return buffer;
  }

  /** Peeks a single byte */
  peekByte(offset = this.#offset): number {
    return this.peekUInt(offset);
  }

  /** Peeks an int8 */
  peekInt(offset = this.#offset): number {
    return this.#data.getInt8(offset);
  }

  /** Peeks an uint8 */
  peekUInt(offset = this.#offset): number {
    return this.#data.getUint8(offset);
  }

  /** Peeks a uint16 */
  peekUInt16(offset = this.#offset): number {
    return this.#data.getUint16(offset, this.#endianus === LITTLE_ENDIAN);
  }

  /** Peeks a uint32 */
  peekUInt32(offset = this.#offset): number {
    return this.#data.getUint32(offset, this.#endianus === LITTLE_ENDIAN);
  }

  /** Peeks an int16 */
  peekInt16(offset = this.#offset): number {
    return this.#data.getInt16(offset, this.#endianus === LITTLE_ENDIAN);
  }

  /** Peeks an int32 */
  peekInt32(offset = this.#offset): number {
    return this.#data.getInt32(offset, this.#endianus === LITTLE_ENDIAN);
  }

  /** Peeks a float */
  peekSingle(offset = this.#offset): number {
    return this.#data.getFloat32(offset, this.#endianus === LITTLE_ENDIAN);
  }

  /** Peeks a double */
  peekDouble(offset = this.#offset): number {
    return this.#data.getFloat64(offset, this.#endianus === LITTLE_ENDIAN);
  }

  /** 
   * Peeks a string
   * @param count The number of characters to peek
   */
  peekString(count: number = 0): string {
    if (count === 0) {
      const bytePosition = this.bytePosition;
      const chars = [];
      while (this.peekByte() != 0x0) {
        chars.push(this.readString(1));
      }
      this.bytePosition = bytePosition;
      return chars.join("");
    }
    return new TextDecoder().decode(this.peek(count));
  }

  /** Reads a 7-bit number. */
  read7BitNumber(): number {
    let result = 0;
    let bitsRead = 0;
    let value;

    // loop over bits
    do {
      value = this.readByte();
      result |= (value & 0x7F) << bitsRead;
      bitsRead += 7;
    } while (value & 0x80);

    return result;
  }

  /**
   * Reads bits used for LZX compression.
   * @param bits The number of bits to read.
   */
  readLZXBits(bits: number): number {
    // initialize values for the loop
    let bitsLeft = bits;
    let read = 0;

    // read bits in 16-bit chunks
    while (bitsLeft > 0) {
      // peek in a 16-bit value
      const peek = this.#data.getUint16(
        this.#offset,
        this.#endianus === LITTLE_ENDIAN,
      );

      // clamp bits into the 16-bit frame we have left only read in as much as we have left
      const bitsInFrame = Math.min(
        Math.max(bitsLeft, 0),
        16 - this.bitPosition,
      );
      // set the offset based on current position in and bit count
      const offset = 16 - this.bitPosition - bitsInFrame;

      // create mask and shift the mask up to the offset <<
      // and then shift the return back down into mask space >>
      const value = (peek & (2 ** bitsInFrame - 1 << offset)) >> offset;

      // Log.debug(Log.b(peek, 16, this.bitPosition, this.bitPosition + bitsInFrame));

      // remove the bits we read from what we have left
      bitsLeft -= bitsInFrame;
      // add the bits read to the bit position
      this.bitPosition += bitsInFrame;

      // assign read with the value shifted over for reading in loops
      read |= value << bitsLeft;
    }

    // return the read bits
    return read;
  }

  /**
   * Used to peek bits.
   * @param bits The number of bits to peek
   */
  peekLZXBits(bits: number): number {
    // get the current bit position to store
    let bitPosition = this.bitPosition;
    // get the current byte position to store
    let bytePosition = this.bytePosition;

    // read the bits like normal
    const read = this.readLZXBits(bits);

    // just rewind the bit position, this will also rewind bytes where needed
    this.bitPosition = bitPosition;
    // restore the byte position
    this.bytePosition = bytePosition;

    // return the peeked value
    return read;
  }

  /**
   * Reads a 16-bit integer from a LZX bitstream
   *
   * bytes are reverse as the bitstream sequences 16 bit integers stored as LSB -> MSB (bytes)
   * abc[...]xyzABCDEF as bits would be stored as:
   * [ijklmnop][abcdefgh][yzABCDEF][qrstuvwx]
   *
   * @param seek Whether to update the seek position
   */
  readLZXInt16(seek: boolean = true): number {
    // read in the next two bytes worth of data
    const lsB = this.readByte();
    const msB = this.readByte();

    // rewind the seek head
    if (!seek) {
      this.seek(-2);
    }

    // set the value
    return (lsB << 8) | msB;
  }

  /** Aligns to 16-bit offset. */
  align() {
    if (this.bitPosition > 0) {
      this.bitPosition += 16 - this.bitPosition;
    }
  }

  /** Used only for error logging. */
  debug() {
    // store reference to the byte position
    const bytePosition = this.bytePosition;
    // move back by 8 bytes
    const diff = Math.abs(this.seek(-8));
    // read 16 bytes worth of data into an array
    const read = this.peek(17).values();
    const bytes = [];
    const chars = [];
    let i = 0;
    for (let byte of read) {
      bytes.push(
        "00".slice(0, 2 - byte.toString(16).length) +
          byte.toString(16).toUpperCase(),
      );
      let char;
      if (byte > 0x1f && byte < 0x7E) {
        char = String.fromCharCode(byte);
      } else {
        char = " ";
      }
      chars.push(char);
      i++;
    }
    const ldlpos = diff - (bytePosition - this.#lastDebugLoc);
    // replace the selected byte with brackets
    bytes[diff] = black(bgBlue(bytes[diff]));
    if (ldlpos > 0 && ldlpos < 16) {
      bytes[ldlpos] = black(bgMagenta(bytes[ldlpos]));
    }

    // log the message
    console.log(bytes.join(" "));
    console.log(gray(chars.join("  ")));

    // re-seek back
    this.seek(bytePosition, 0);
    // update last debug loc
    this.#lastDebugLoc = bytePosition;
  }
}

// export the BufferReader class
export default BufferReader;
