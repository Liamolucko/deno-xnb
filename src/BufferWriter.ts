class BufferWriter {
  private _buffer: Uint8Array;
  dataView: DataView;

  bytePosition: number;

  constructor(size = 500) {
    // the buffer to write to
    this._buffer = new Uint8Array(size);
    this.dataView = new DataView(this.buffer.buffer);
    // the current byte position
    this.bytePosition = 0;
  }

  /**
     * Returns the buffer.
     * @public
     * @property buffer
     * @returns Returns the internal buffer.
     */
  get buffer(): Uint8Array {
    return this._buffer;
  }

  // trim the buffer to the byte position
  trim() {
    this._buffer = new Uint8Array(this.buffer, 0, this.bytePosition);
    this.dataView = new DataView(this.buffer.buffer);
  }

  /**
     * Allocates number of bytes into the buffer and assigns more space if needed
     * @param bytes Number of bytes to allocate into the buffer
     */
  alloc(bytes: number) {
    if (this.buffer.length <= this.bytePosition + bytes) {
      this._buffer = new Uint8Array(this.buffer, 0, bytes);
    }
    return this;
  }

  concat(buffer: Uint8Array) {
    this.trim();
    const tempBuffer = new Uint8Array(this.buffer.length + buffer.length);
    tempBuffer.set(this.buffer);
    tempBuffer.set(buffer, this.buffer.length);
    this._buffer = tempBuffer;
    this.dataView = new DataView(this.buffer.buffer);
    this.bytePosition += buffer.length;
  }

  /**
     * Writes bytes to the buffer
     * @param bytes 
     */
  write(bytes: Uint8Array) {
    this.alloc(bytes.length).buffer.set(bytes, this.bytePosition);
    this.bytePosition += bytes.length;
  }

  /**
     * Write a byte to the buffer
     * @param byte 
     */
  writeByte(byte: number) {
    this.alloc(1).dataView.setUint8(byte, this.bytePosition);
    this.bytePosition++;
  }

  /**
     * Write an int8 to the buffer
     * @param number 
     */
  writeInt(number: number) {
    this.alloc(1).dataView.setInt8(number, this.bytePosition);
    this.bytePosition++;
  }

  /**
     * Write a uint8 to the buffer
     * @param number 
     */
  writeUInt(number: number) {
    this.alloc(1).dataView.setUint8(number, this.bytePosition);
    this.bytePosition++;
  }

  /**
     * Write a int16 to the buffer
     * @param number 
     */
  writeInt16(number: number) {
    this.alloc(2).dataView.setInt16(number, this.bytePosition);
    this.bytePosition += 2;
  }

  /**
     * Write a uint16 to the buffer
     * @param number 
     */
  writeUInt16(number: number) {
    this.alloc(2).dataView.setUint16(number, this.bytePosition);
    this.bytePosition += 2;
  }

  /**
     * Write a int32 to the buffer
     * @param number 
     */
  writeInt32(number: number) {
    this.alloc(4).dataView.setInt32(number, this.bytePosition);
    this.bytePosition += 4;
  }

  /**
     * Write a uint32 to the buffer
     * @param number 
     */
  writeUInt32(number: number) {
    this.alloc(4).dataView.setUint32(number, this.bytePosition);
    this.bytePosition += 4;
  }

  /**
     * Write a float to the buffer
     * @param number 
     */
  writeSingle(number: number) {
    this.alloc(4).dataView.setFloat32(number, this.bytePosition);
    this.bytePosition += 4;
  }

  /**
     * Write a double to the buffer
     * @param number 
     */
  writeDouble(number: number) {
    this.alloc(4).dataView.setFloat64(number, this.bytePosition);
    this.bytePosition += 4;
  }

  /**
     * Write a 7-bit number to the buffer
     * @param number 
     */
  write7BitNumber(number: number) {
    this.alloc(2);
    do {
      let byte = number & 0x7F;
      number = number >> 7;
      if (number) byte |= 0x80;
      this.dataView.setUint8(byte, this.bytePosition);
      this.bytePosition++;
    } while (number);
  }
}

// export the BufferWriter class
export default BufferWriter;
