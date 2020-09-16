export class BinaryReader {
  /** The internal buffer for the reader */
  #buffer: Uint8Array;
  #view: DataView;

  /** The seek index of the buffer. */
  bytePosition = 0;

  /**
   * Creates instance of Reader class.
   * @param buffer The buffer to read with the reader.
   */
  constructor(buffer: Uint8Array) {
    this.#buffer = buffer;
    this.#view = new DataView(buffer.buffer);
  }

  /** The buffer size. */
  get size(): number {
    return this.buffer.length;
  }

  /** The buffer being read. */
  get buffer(): Uint8Array {
    return this.#buffer;
  }

  get view() {
    return this.#view;
  }

  /** Writes another buffer into this buffer. */
  copyFrom(
    buffer: Uint8Array,
    targetIndex = 0,
    sourceIndex = 0,
    length = buffer.length,
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
      this.#view = new DataView(this.buffer.buffer);
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
  readBytes(count: number): Uint8Array {
    // read from the buffer
    const out = this.peekBytes(count);
    // advance seek offset
    this.bytePosition += count;
    // return the read buffer
    return out;
  }

  readByte(): number {
    return this.readUint8();
  }

  readInt8(): number {
    const out = this.peekInt8();
    this.bytePosition += 1;
    return out;
  }

  /** Reads an uint8 */
  readUint8(): number {
    const out = this.peekUint8();
    this.bytePosition += 1;
    return out;
  }

  readInt16(littleEndian?: boolean): number {
    const out = this.peekInt16(littleEndian);
    this.bytePosition += 2;
    return out;
  }

  readUint16(littleEndian?: boolean): number {
    const out = this.peekUint16(littleEndian);
    this.bytePosition += 2;
    return out;
  }

  readInt32(littleEndian?: boolean): number {
    const out = this.peekInt32(littleEndian);
    this.bytePosition += 4;
    return out;
  }

  readUint32(littleEndian?: boolean): number {
    const out = this.peekUint32(littleEndian);
    this.bytePosition += 4;
    return out;
  }

  readFloat32(littleEndian?: boolean): number {
    const out = this.peekFloat32(littleEndian);
    this.bytePosition += 4;
    return out;
  }

  readFloat64(littleEndian?: boolean): number {
    const out = this.peekFloat64(littleEndian);
    this.bytePosition += 4;
    return out;
  }

  /** Reads a string */
  readString(count = 0): string {
    if (count === 0) {
      const chars = [];
      while (this.peekByte() != 0x0) {
        chars.push(this.readString(1));
      }
      this.bytePosition += 1;
      return chars.join("");
    }
    return new TextDecoder().decode(this.readBytes(count));
  }

  /** Peeks ahead in the buffer without actually seeking ahead. */
  peekBytes(count: number): Uint8Array {
    return this.buffer.slice(
      this.bytePosition,
      this.bytePosition + count,
    );
  }

  peekByte(): number {
    return this.peekUint8();
  }

  peekInt8(): number {
    return this.#view.getInt8(this.bytePosition);
  }

  peekUint8(): number {
    return this.#view.getUint8(this.bytePosition);
  }

  peekInt16(littleEndian?: boolean): number {
    return this.#view.getInt16(this.bytePosition, littleEndian);
  }

  peekUint16(littleEndian?: boolean): number {
    return this.#view.getUint16(this.bytePosition, littleEndian);
  }

  peekInt32(littleEndian?: boolean): number {
    return this.#view.getInt32(this.bytePosition, littleEndian);
  }

  peekUint32(littleEndian?: boolean): number {
    return this.#view.getUint32(this.bytePosition, littleEndian);
  }

  peekFloat32(littleEndian?: boolean): number {
    return this.#view.getFloat32(this.bytePosition, littleEndian);
  }

  peekFloat64(littleEndian?: boolean): number {
    return this.#view.getFloat64(this.bytePosition, littleEndian);
  }

  /** 
   * Peeks a string
   * @param count The number of characters to peek
   */
  peekString(count = 0): string {
    if (count === 0) {
      const bytePosition = this.bytePosition;
      const chars = [];
      while (this.peekByte() != 0x0) {
        chars.push(this.readString(1));
      }
      this.bytePosition = bytePosition;
      return chars.join("");
    }
    return new TextDecoder().decode(this.peekBytes(count));
  }

  /** Reads a 7-bit number. */
  read7BitEncodedNumber(): number {
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
}

export class BinaryWriter {
  #buffer: Uint8Array;
  #view: DataView;

  bytePosition: number;

  constructor(size = 500) {
    // the buffer to write to
    this.#buffer = new Uint8Array(size);
    this.#view = new DataView(this.buffer.buffer);
    // the current byte position
    this.bytePosition = 0;
  }

  /** The buffer being written to */
  get buffer(): Uint8Array {
    return this.#buffer;
  }

  get view() {
    return this.#view;
  }

  // trim the buffer to the byte position
  trim() {
    this.#buffer = this.buffer.slice(0, this.bytePosition);
    this.#view = new DataView(this.buffer.buffer);
  }

  /**
   * Allocates number of bytes into the buffer and assigns more space if needed
   * @param bytes Number of bytes to allocate into the buffer
   */
  alloc(bytes: number) {
    if (this.buffer.length <= this.bytePosition + bytes) {
      // I think this should probably be `this.bytePosition + bytes`,
      // but this way makes it work. I feel like it might be hiding
      // some underlying problem.
      const tempBuffer = new Uint8Array(this.buffer.length + bytes);
      tempBuffer.set(this.buffer);
      this.#buffer = tempBuffer;
      this.#view = new DataView(this.buffer.buffer);
    }
    return this;
  }

  concat(buffer: Uint8Array) {
    this.trim();
    const tempBuffer = new Uint8Array(this.buffer.length + buffer.length);
    tempBuffer.set(this.buffer);
    tempBuffer.set(buffer, this.buffer.length);
    this.#buffer = tempBuffer;
    this.#view = new DataView(this.buffer.buffer);
    this.bytePosition += buffer.length;
  }

  /**
   * Writes bytes to the buffer
   * @param bytes 
   */
  writeBytes(bytes: Uint8Array) {
    this.alloc(bytes.length).buffer.set(bytes, this.bytePosition);
    this.bytePosition += bytes.length;
  }

  /**
   * Write a byte to the buffer
   * @param byte 
   */
  writeByte(byte: number) {
    this.alloc(1).#view.setUint8(this.bytePosition, byte);
    this.bytePosition++;
  }

  writeInt8(number: number) {
    this.alloc(1).#view.setInt8(this.bytePosition, number);
    this.bytePosition++;
  }

  writeUint8(number: number) {
    this.alloc(1).#view.setUint8(this.bytePosition, number);
    this.bytePosition++;
  }

  writeInt16(number: number, littleEndian?: boolean) {
    this.alloc(2).#view.setInt16(this.bytePosition, number, littleEndian);
    this.bytePosition += 2;
  }

  writeUint16(number: number, littleEndian?: boolean) {
    this.alloc(2).#view.setUint16(this.bytePosition, number, littleEndian);
    this.bytePosition += 2;
  }

  writeInt32(number: number, littleEndian?: boolean) {
    this.alloc(4).#view.setInt32(this.bytePosition, number, littleEndian);
    this.bytePosition += 4;
  }

  writeUint32(number: number, littleEndian?: boolean) {
    this.alloc(4).#view.setUint32(this.bytePosition, number, littleEndian);
    this.bytePosition += 4;
  }

  writeFloat32(number: number, littleEndian?: boolean) {
    this.alloc(4).#view.setFloat32(this.bytePosition, number, littleEndian);
    this.bytePosition += 4;
  }

  writeFloat64(number: number, littleEndian?: boolean) {
    this.alloc(4).#view.setFloat64(this.bytePosition, number, littleEndian);
    this.bytePosition += 4;
  }

  /**
   * Write a 7-bit number to the buffer
   * @param number 
   */
  write7BitEncodedNumber(number: number) {
    this.alloc(2);
    do {
      let byte = number & 0b01111111;
      number >>= 7;
      if (number) byte |= 0b10000000;
      this.#view.setUint8(this.bytePosition, byte);
      this.bytePosition++;
    } while (number);
  }
}

/** Subclass of BinaryReader with Lzx specific methods. */
export class LzxBitReader extends BinaryReader {
  /** Bit offset for bit reading. */
  #bitOffset = 0;

  /** The current position for bit reading. */
  get bitOffset(): number {
    return this.#bitOffset;
  }

  set bitOffset(offset: number) {
    // when rewinding, reset it back to
    if (offset < 0) offset = 16 - offset;
    // set the offset and clamp to 16-bit frame
    this.#bitOffset = offset % 16;
    // get byte seek for bit ranges that wrap past 16-bit frames
    const byteSeek = ((offset - (Math.abs(offset) % 16)) / 16) * 2;
    // seek ahead for overflow on 16-bit frames
    this.bytePosition += byteSeek;
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
      const peek = this.view.getUint16(
        this.bytePosition,
        true,
      );

      // clamp bits into the 16-bit frame we have left only read in as much as we have left
      const bitsInFrame = Math.min(
        Math.max(bitsLeft, 0),
        16 - this.bitOffset,
      );
      // set the offset based on current position in and bit count
      const offset = 16 - this.bitOffset - bitsInFrame;

      // create mask and shift the mask up to the offset <<
      // and then shift the return back down into mask space >>
      const value = (peek & (2 ** bitsInFrame - 1 << offset)) >> offset;

      // Log.debug(Log.b(peek, 16, this.bitPosition, this.bitPosition + bitsInFrame));

      // remove the bits we read from what we have left
      bitsLeft -= bitsInFrame;
      // add the bits read to the bit position
      this.bitOffset += bitsInFrame;

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
    let bitPosition = this.bitOffset;
    // get the current byte position to store
    let bytePosition = this.bytePosition;

    // read the bits like normal
    const read = this.readLZXBits(bits);

    // just rewind the bit position, this will also rewind bytes where needed
    this.bitOffset = bitPosition;
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
  readLZXInt16(seek = true): number {
    // read in the next two bytes worth of data
    const lsB = this.readByte();
    const msB = this.readByte();

    // rewind the seek head
    if (!seek) {
      this.bytePosition += -2;
    }

    // set the value
    return (lsB << 8) | msB;
  }

  /** Aligns to 16-bit offset. */
  align() {
    if (this.bitOffset > 0) {
      this.bitOffset += 16 - this.bitOffset;
    }
  }
}
