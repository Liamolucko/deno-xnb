import BaseReader from './BaseReader.ts';
import BufferReader from '../../BufferReader.ts';
import BufferWriter from '../../BufferWriter.ts';
import BooleanReader from './BooleanReader.ts';
import ReaderResolver from '../ReaderResolver.ts';

/**
 * Nullable Reader
 * @class
 * @extends BaseReader
 */
class NullableReader extends BaseReader {
    reader: BaseReader;
    /**
     * @constructor
     * @param {BaseReader} reader
     */
    constructor(reader: BaseReader) {
        super();
        /**
         * Nullable type
         * @type {BaseReader}
         */
        this.reader = reader;
    }

    /**
     * Reads Nullable type from buffer.
     * @param {BufferReader} buffer
     * @param {ReaderResolver} resolver
     * @returns {mixed|null}
     */
    read(buffer: BufferReader, resolver?: ReaderResolver | null): any | null {
        // get an instance of boolean reader
        const booleanReader = new BooleanReader();
        // read in if the nullable has a value or not
        const hasValue = booleanReader.read(buffer);

        // return the value
        return (hasValue ? (this.reader.isValueType() ? this.reader.read(buffer) : resolver?.read(buffer)) : null);
    }

    /**
     * Writes Nullable into the buffer
     * @param {BufferWriter} buffer
     * @param {Mixed} data The data
     * @param {ReaderResolver} resolver
     */
    write(buffer: BufferWriter, content: any, resolver?: ReaderResolver | null) {
        //this.writeIndex(buffer, resolver);
        const booleanReader = new BooleanReader();
        buffer.writeByte(content != null ? 1 : 0);
        if (content != null)
            this.reader.write(buffer, content, (this.reader.isValueType() ? null : resolver));
    }

    isValueType() {
        return false;
    }

    get type() {
        return `Nullable<${this.reader.type}>`;
    }
}

export default NullableReader;
