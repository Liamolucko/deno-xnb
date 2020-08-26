import BaseReader from './BaseReader.ts';
import ReaderResolver from '../ReaderResolver.ts';
import BufferReader from '../../BufferReader.ts';
import BufferWriter from '../../BufferWriter.ts';

/**
 * UInt32 Reader
 * @class
 * @extends BaseReader
 */
class UInt32Reader extends BaseReader {
    /**
     * Reads UInt32 from buffer.
     * @param {BufferReader} buffer
     * @returns {Number}
     */
    read(buffer: BufferReader): number {
        return buffer.readUInt32();
    }

    /**
     * 
     * @param {BufferWriter} buffer 
     * @param {Number} content 
     * @param {ReaderResolver} resolver 
     */
    write(buffer: BufferWriter, content: number, resolver?: ReaderResolver | null) {
        this.writeIndex(buffer, resolver);
        buffer.writeUInt32(content);
    }
}

export default UInt32Reader;
