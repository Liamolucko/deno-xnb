import BaseReader from './BaseReader.ts';
import BufferReader from '../../BufferReader.ts';
import BufferWriter from '../../BufferWriter.ts';
import ReaderResolver from '../ReaderResolver.ts';
import UInt32Reader from './UInt32Reader.ts';
import XnbError from '../../XnbError.ts';

/**
 * Dictionary Reader
 * @class
 * @extends BaseReader
 */
class DictionaryReader extends BaseReader {
    key: BaseReader;
    value: BaseReader;

    /**
     * Constructor for DictionaryReader.
     * @constructor
     * @param {BaseReader} key The BaseReader for the dictionary key.
     * @param {BaseReader} value The BaseReader for the dictionary value.
     */
    constructor(key: BaseReader, value: BaseReader) {
        // verify key and value are specified
        if (key == undefined || value == undefined)
            throw new XnbError('Cannot create instance of DictionaryReader without Key and Value.');

        // call base constructor
        super();

        /** @type {BaseReader} */
        this.key = key;
        /** @type {BaseReader} */
        this.value = value;
    }

    /**
     * Reads Dictionary from buffer.
     * @param {BufferReader} buffer Buffer to read from.
     * @param {ReaderResolver} resolver ReaderResolver to read non-primitive types.
     * @returns {object}
     */
    read(buffer: BufferReader, resolver: ReaderResolver): object {
        // the dictionary to return
        let dictionary = {};

        // read in the size of the dictionary
        const uint32Reader = new UInt32Reader();
        const size = uint32Reader.read(buffer);

        // loop over the size of the dictionary and read in the data
        for (let i = 0; i < size; i++) {
            // get the key
            let key = this.key.isValueType() ? this.key.read(buffer) : resolver.read(buffer);
            // get the value
            let value = this.value.isValueType() ? this.value.read(buffer) : resolver.read(buffer);

            // @ts-ignore assign KV pair to the dictionary
            dictionary[key] = value;
        }

        // return the dictionary object
        return dictionary;
    }

    /**
     * Writes Dictionary into buffer
     * @param {BufferWriter} buffer
     * @param {Object} data The data to parse for the 
     * @param {ReaderResolver} resolver ReaderResolver to write non-primitive types
     * @returns {Buffer} buffer instance with the data in it
     */
    write(buffer: BufferWriter, content: Record<string, any>, resolver: ReaderResolver): void {
        // write the index
        this.writeIndex(buffer, resolver);

        // write the amount of entries in the Dictionary
        buffer.writeUInt32(Object.keys(content).length);
        
        // loop over the entries
        for (let key of Object.keys(content)) {
            // write the key
            this.key.write(buffer, key, (this.key.isValueType() ? null : resolver));
            // write the value
            this.value.write(buffer, content[key], (this.value.isValueType() ? null : resolver));
        }
    }

    isValueType() {
        return false;
    }

    get type() {
        return `Dictionary<${this.key.type},${this.value.type}>`;
    }
}

export default DictionaryReader;
