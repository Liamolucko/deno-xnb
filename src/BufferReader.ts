import { bgBlue, bgMagenta, black, gray } from "https://deno.land/std@0.66.0/fmt/colors.ts";
import * as fs from "https://deno.land/std@0.66.0/fs/mod.ts";
import XnbError from './XnbError.ts';

const LITTLE_ENDIAN = 0;
const BIG_ENDIAN = 1;

class BufferReader {
  private _buffer: Uint8Array;
  private _dataView: DataView;
  private _offset: number;
  private _bitOffset: number;
  private _lastDebugLoc: number;
  private _endianus: number;

  /**
   * Creates instance of Reader class.
   * @constructor
   * @param filename The filename to read with the reader.
   */
  constructor(filename: string, endianus = LITTLE_ENDIAN) {
    // ensure the file exists
    if (!fs.existsSync(filename)) {
      throw new XnbError(`"${filename}" does not exist!`);
    }

    /**
     * Sets the endianness of the buffer stream
     * @private
     * @type {Number}
     */
    this._endianus = endianus;

    /**
     * internal buffer for the reader
     * @private
     * @type 
     */
    this._buffer = Deno.readFileSync(filename);
    this._dataView = new DataView(this.buffer.buffer);

    /**
     * Seek index for the internal buffer.
     * @private
     * @type
     */
    this._offset = 0;

    /**
     * Bit offset for bit reading.
     * @private
     * @type
     */
    this._bitOffset = 0;

    /**
     * Last debug location for logging byte locations
     * @private
     * @type
     */
    this._lastDebugLoc = 0;
  }

  /**
    * Seeks to a specific index in the buffer.
    * @public
    * @param index Sets the buffer seek index.
    * @param origin Location to seek from
    */
  seek(index: number, origin: number = this._offset) {
    const offset = this._offset;
    this._offset = Math.max(origin + index, 0);
    if (this._offset < 0 || this._offset > this.buffer.length) {
      throw new XnbError(
        `Buffer seek out of bounds! ${this._offset} ${this.buffer.length}`,
      );
    }
    return this._offset - offset;
  }

  /**
     * Gets the seek index of the buffer.
     * @public
     * @property bytePosition
     * @return Reurns the buffer seek index.
     */
  get bytePosition(): number {
    return this._offset;
  }

  /**
     * Sets the seek index of the buffer.
     * @public
     * @property bytePosition
     * @param value
     */
  set bytePosition(value: number) {
    this._offset = value;
  }

  /**
     * Gets the current position for bit reading.
     * @public
     * @property _bitPosition
     * @returns
     */
  get bitPosition(): number {
    return this._bitOffset;
  }

  /**
     * Sets the bit position clamped at 16-bit frames
     * @public
     * @property bitPosition
     * @param offset
     */
  set bitPosition(offset: number) {
    // when rewinding, reset it back to
    if (offset < 0) offset = 16 - offset;
    // set the offset and clamp to 16-bit frame
    this._bitOffset = offset % 16;
    // get byte seek for bit ranges that wrap past 16-bit frames
    const byteSeek = ((offset - (Math.abs(offset) % 16)) / 16) * 2;
    // seek ahead for overflow on 16-bit frames
    this.seek(byteSeek);
  }

  /**
     * Get the buffer size.
     * @public
     * @property size
     * @return {Number} Returns the size of the buffer.
     */
  get size(): number {
    return this.buffer.length;
  }

  /**
     * Returns the buffer.
     * @public
     * @property buffer
     * @returns {Buffer} Returns the internal buffer.
     */
  get buffer(): Uint8Array {
    return this._buffer;
  }

  /**
     * Writes another buffer into this buffer.
     * @public
     * @method write
     */
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
      this._buffer = tempBuffer;
      this._dataView = new DataView(this.buffer.buffer);
    } else {
      // copy the buffer into our buffer
      this.buffer.set(buffer.slice(sourceIndex, length), targetIndex);
    }
  }

  /**
     * Reads a specific number of bytes.
     * @public
     * @method read
     * @param count Number of bytes to read.
     * @returns Contents of the buffer.
     */
  read(count: number): Uint8Array {
    // read from the buffer
    const buffer = this.buffer.slice(this._offset, this._offset + count);
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
     * @returns {Number}
     */
  readByte(): number {
    return this.readUInt();
  }

  /**
     * Reads an int8
     * @public
     * @returns {Number}
     */
  readInt(): number {
    const out = this.peekInt();
    this.seek(1);
    return out;
  }

  /**
     * Reads an uint8
     * @public
     * @returns {Number}
     */
  readUInt(): number {
    const out = this.peekUInt();
    this.seek(1);
    return out;
  }

  /**
     * Reads a uint16
     * @public
     * @returns {Number}
     */
  readUInt16(): number {
    const out = this.peekUInt16();
    this.seek(2);
    return out;
  }

  /**
     * Reads a uint32
     * @public
     * @returns {Number}
     */
  readUInt32(): number {
    const out = this.peekUInt32();
    this.seek(4);
    return out;
  }

  /**
     * Reads an int16
     * @public
     * @returns {Number}
     */
  readInt16(): number {
    const out = this.peekInt16();
    this.seek(2);
    return out;
  }

  /**
     * Reads an int32
     * @public
     * @returns {Number}
     */
  readInt32(): number {
    const out = this.peekInt32();
    this.seek(4);
    return out;
  }

  /**
     * Reads a float
     * @public
     * @returns {Number}
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

  /**
     * Peeks ahead in the buffer without actually seeking ahead.
     * @public
     * @method peek
     * @param count Number of bytes to peek.
     * @returns Contents of the buffer.
     */
  peek(count: number): Uint8Array {
    // read from the buffer
    const buffer = this.read(count);
    // rewind the buffer
    this.seek(-count);
    // return the buffer
    return buffer;
  }

  /**
     * Peeks a single byte
     * @public
     * @returns {Number}
     */
  peekByte(): number {
    return this.peekUInt();
  }

  /**
     * Peeks an int8
     * @public
     * @returns {Number}
     */
  peekInt(): number {
    return this._dataView.getInt8(this._offset);
  }

  /**
     * Peeks an uint8
     * @public
     * @returns {Number}
     */
  peekUInt(): number {
    return this._dataView.getUint8(this._offset);
  }

  /**
     * Peeks a uint16
     * @public
     * @returns {Number}
     */
  peekUInt16(): number {
    return this._dataView.getUint16(this._offset, this._endianus === LITTLE_ENDIAN);
  }

  /**
     * Peeks a uint32
     * @public
     * @returns {Number}
     */
  peekUInt32(): number {
    return this._dataView.getUint32(this._offset, this._endianus === LITTLE_ENDIAN);
  }

  /**
     * Peeks an int16
     * @public
     * @returns {Number}
     */
  peekInt16(): number {
    return this._dataView.getInt16(this._offset, this._endianus === LITTLE_ENDIAN);
  }

  /**
     * Peeks an int32
     * @public
     * @returns {Number}
     */
  peekInt32(): number {
    return this._dataView.getInt32(this._offset, this._endianus === LITTLE_ENDIAN);
  }

  /**
     * Peeks a float
     * @public
     * @returns {Number}
     */
  peekSingle(): number {
    return this._dataView.getFloat32(this._offset, this._endianus === LITTLE_ENDIAN);
  }

  /**
     * Peeks a double
     * @public
     * @returns {Number}
     */
  peekDouble(): number {
    return this._dataView.getFloat64(this._offset, this._endianus === LITTLE_ENDIAN);
  }

  /**
     * Peeks a string
     * @public
     * @param {Number} [count]
     * @returns {String}
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

  /**
     * Reads a 7-bit number.
     * @public
     * @method read7BitNumber
     * @returns {Number} Returns the number read.
     */
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
     * @public
     * @method readLZXBits
     * @param {Number} bits
     * @returns {Number}
     */
  readLZXBits(bits: number): number {
    // initialize values for the loop
    let bitsLeft = bits;
    let read = 0;

    // read bits in 16-bit chunks
    while (bitsLeft > 0) {
      // peek in a 16-bit value
      const peek = this._dataView.getUint16(this._offset, this._endianus === LITTLE_ENDIAN);

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
     * @public
     * @method peekLZXBits
     * @param {Number} bits
     * @returns {Number}
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
     * @public
     * @method readLZXInt16
     * @param {Boolean} seek
     * @returns {Number}
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

  /**
     * Aligns to 16-bit offset.
     * @public
     * @method align
     */
  align() {
    if (this.bitPosition > 0) {
      this.bitPosition += 16 - this.bitPosition;
    }
  }

  /**
     * Used only for error logging.
     * @public
     */
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
    const ldlpos = diff - (bytePosition - this._lastDebugLoc);
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
    this._lastDebugLoc = bytePosition;
  }
}

// export the BufferReader class
export default BufferReader;
