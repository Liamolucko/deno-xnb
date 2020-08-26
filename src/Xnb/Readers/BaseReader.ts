import XnbError from '../../XnbError.ts'
import BufferReader from '../../BufferReader.ts'
import BufferWriter from '../../BufferWriter.ts'
import ReaderResolver from '../ReaderResolver.ts'

/**
 * Base class for all readers.
 * @abstract
 * @class
 */
class BaseReader {
    /**
     * Returns if type normally requires a special reader.
     * @public
     * @method
     * @returns {Boolean} Returns true if type is primitive.
     */
    isValueType(): boolean {
        return true;
    }

    /**
     * Returns string type of reader
     * @public
     * @property
     * @returns {string}
     */
    get type(): string {
        return this.constructor.name.slice(0, -6);
    }

    /**
     * Reads the buffer by the specification of the type reader.
     * @public
     * @param {BufferReader} buffer The buffer to read from.
     * @param {ReaderResolver} resolver The content reader to resolve readers from.
     * @returns {mixed} Returns the type as specified by the type reader.
     */
    read(buffer: BufferReader, resolver?: ReaderResolver | null): unknown {
        throw new XnbError('Cannot invoke methods on abstract class.');
    }

    /**
     * Writes into the buffer
     * @param {BufferWriter} buffer The buffer to write to
     * @param {Mixed} data The data to parse to write to the buffer
     * @param {ReaderResolver} resolver ReaderResolver to write non-primitive types
     */
    write(buffer: BufferWriter, content: any, resolver?: ReaderResolver | null) {
        throw new XnbError('Cannot invoke methods on abstract class.');
    }

    /**
     * Writes the index of this reader to the buffer
     * @param {BufferWriter} buffer
     * @param {ReaderResolver} resolver 
     */
    writeIndex(buffer: BufferWriter, resolver?: ReaderResolver | null) {
        if (resolver != null)
            buffer.write7BitNumber(Number.parseInt(resolver.getIndex(this)!) + 1);
    }

    /**
     * When printing out in a string.
     * @returns {String}
     */
    toString(): string {
        return this.type;
    }
}

export default BaseReader;
