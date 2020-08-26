import BaseReader from './BaseReader.ts';
import BufferReader from '../../BufferReader.ts';
import BufferWriter from '../../BufferWriter.ts';
import ReaderResolver from '../ReaderResolver.ts';

/**
 * Single Reader
 * @class
 * @extends BaseReader
 */
class SingleReader extends BaseReader {
    /**
     * Reads Single from the buffer.
     * @param {BufferReader} buffer
     * @returns {Number}
     */
    read(buffer: BufferReader): number {
        return buffer.readSingle();
    }

    write(buffer: BufferWriter, content: number, resolver?: ReaderResolver | null) {
        this.writeIndex(buffer, resolver);
        buffer.writeSingle(content);
    }
}

export default SingleReader;
