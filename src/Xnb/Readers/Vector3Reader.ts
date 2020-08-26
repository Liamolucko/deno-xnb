import BufferReader from '../../BufferReader.ts';
import BufferWriter from '../../BufferWriter.ts';
import ReaderResolver from '../ReaderResolver.ts';
import BaseReader from './BaseReader.ts';
import SingleReader from './SingleReader.ts';

/**
 * Vector3 Reader
 * @class
 * @extends BaseReader
 */
class Vector3Reader extends BaseReader {
    /**
     * Reads Vector3 from buffer.
     * @param {BufferReader} buffer
     * @returns {object}
     */
    read(buffer: BufferReader): object {
        const singleReader = new SingleReader();

        let x = singleReader.read(buffer);
        let y = singleReader.read(buffer);
        let z = singleReader.read(buffer);

        return { x, y, z };
    }

    write(buffer: BufferWriter, content: {x: number, y: number, z: number}, resolver?: ReaderResolver | null) {
        this.writeIndex(buffer, resolver);
        const singleReader = new SingleReader();
        singleReader.write(buffer, content.x, null);
        singleReader.write(buffer, content.y, null);
        singleReader.write(buffer, content.z, null);
    }
}

export default Vector3Reader;
