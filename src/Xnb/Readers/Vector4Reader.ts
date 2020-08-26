import BaseReader from './BaseReader.ts';
import BufferReader from '../../BufferReader.ts';
import SingleReader from './SingleReader.ts';

/**
 * Vector4 Reader
 * @class
 * @extends BaseReader
 */
class Vector4Reader extends BaseReader {
    /**
     * Reads Vector4 from buffer.
     * @param {BufferReader} buffer
     * @returns {object}
     */
    read(buffer: BufferReader): {x: number, y: number, z: number, w: number} {
        const singleReader = new SingleReader();

        let x = singleReader.read(buffer);
        let y = singleReader.read(buffer);
        let z = singleReader.read(buffer);
        let w = singleReader.read(buffer);

        return { x, y, z, w };
    }
}

export default Vector4Reader;
