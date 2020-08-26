import BaseReader from './BaseReader.ts';
import BufferReader from '../../BufferReader.ts';
import SingleReader from './SingleReader.ts';

/**
 * Vector2 Reader
 * @class
 * @extends BaseReader
 */
class Vector2Reader extends BaseReader {
    /**
     * Reads Vector2 from buffer.
     * @param {BufferReader} buffer
     * @returns {object}
     */
    read(buffer: BufferReader): object {
        const singleReader = new SingleReader();

        let x = singleReader.read(buffer);
        let y = singleReader.read(buffer);

        return { x, y };
    }
}

export default Vector2Reader;
