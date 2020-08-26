import BaseReader from './BaseReader.ts';
import BufferReader from '../../BufferReader.ts';
import BufferWriter from '../../BufferWriter.ts';
import ReaderResolver from '../ReaderResolver.ts';

/**
 * String Reader
 * @class
 * @extends BaseReader
 */
class StringReader extends BaseReader {
    /**
     * Reads String from buffer.
     * @param {BufferReader} buffer
     * @returns {String}
     */
    read(buffer: BufferReader): string {
        // read in the length of the string
        let length = buffer.read7BitNumber();
        // read in the UTF-8 encoded string
        return new TextDecoder().decode(buffer.read(length));
    }

    /**
     * Writes the string to the buffer.
     * @param {BufferWriter} buffer 
     * @param {String} string 
     * @param {ReaderResolver} resolver
     */
    write(buffer: BufferWriter, string: string, resolver?: ReaderResolver | null) {
        // write the index
        this.writeIndex(buffer, resolver);
        // create a string buffer for special characters 4 extra bytes per utf8 character
        const _buff = new Uint8Array(string.length * 4);
        const charBuf = new TextEncoder().encode(string);
        // write into the buffer and get the size back out
        const size = charBuf.length;
        _buff.set(charBuf);
        // write the length of the string
        buffer.write7BitNumber(size); 
        // write the string
        buffer.concat(_buff.slice(0, size));
    }

    isValueType() {
        return false;
    }
}

export default StringReader;
