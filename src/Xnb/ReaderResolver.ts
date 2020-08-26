import BufferReader from '../BufferReader.ts';
import BufferWriter from '../BufferWriter.ts';
import XnbError from '../XnbError.ts';
import { BaseReader } from './Readers.ts';

/**
 * Class used to read the XNB types using the readers
 * @class
 */
class ReaderResolver {
    readers: BaseReader[];
    /**
     * Creating a new instance of ReaderResolver
     * @constructor
     * @param {BaseReader[]} readers Array of BaseReaders
     */
    constructor(readers: BaseReader[]) {
        /**
         * Array of base readers
         * @type {BaseReader[]}
         */
        this.readers = readers;
    }

    /**
     * Read the XNB file contents
     * @method read
     * @public
     * @param {BufferReader} buffer The buffer to read from.
     */
    read(buffer: BufferReader) {
        // read the index of which reader to use
        let index = buffer.read7BitNumber() - 1;
        if (this.readers[index] == null)
            throw new XnbError(`Invalid reader index ${index}`);
        // read the buffer using the selected reader
        return this.readers[index].read(buffer, this);
    }

    /**
     * Writes the XNB file contents
     * @param {BufferWriter} buffer
     * @param {Object} content 
     */
    write(buffer: BufferWriter, content: object) {
        this.readers[0].write(buffer, content, this);
    }

    /**
     * Returns the index of the reader
     * @param {BaseReader} reader 
     * @param {Number}
     */
    getIndex(reader: BaseReader) {
        for (let i in this.readers)
            if (reader.toString() == this.readers[i].toString())
                return i;
    }
}

export default ReaderResolver;
