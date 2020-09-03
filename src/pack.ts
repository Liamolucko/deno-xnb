import * as lz4 from "https://deno.land/x/lz4@v0.1.2/mod.ts";
import { BufferReader, BufferWriter } from "./buffers.ts";
import * as presser from "./compression.ts";
import XnbError from "./error.ts";
import log from "./log.ts";
import ReaderResolver from "./xnb/reader-resolver.ts";
import { getReader, simplifyType } from "./xnb/resolve-types.ts";
import { Reader } from "./xnb/readers.ts";
import StringReader from "./xnb/readers/string.ts";

// constants
const HIDEF_MASK = 0x1;
const COMPRESSED_LZ4_MASK = 0x40;
const COMPRESSED_LZX_MASK = 0x80;
const XNB_COMPRESSED_PROLOGUE_SIZE = 14;

export interface XnbJson {
  header: {
    target: string;
    formatVersion: number;
    hidef: boolean;
    compressed: boolean;
  };
  readers: {
    type: string;
    version: number;
  }[];
  content: any;
}

/**
  * Unpacks an XNB file.
  * @param file The XNB file you want to load.
  */
export function unpack(file: Uint8Array): XnbJson {
  // create a new instance of reader
  const buffer = new BufferReader(file);

  // validate the XNB file header
  const { target, formatVersion, hidef, compressed, compressionType } =
    parseHeader(buffer);

  // we validated the file successfully
  log.info("XNB file validated successfully!");

  // read the file size
  const fileSize = buffer.readUInt32();

  // verify the size
  if (buffer.size != fileSize) {
    throw new XnbError("XNB file has been truncated!");
  }

  // print out the file size
  log.debug(`File size: ${fileSize} bytes.`);

  // if the file is compressed then we need to decompress it
  if (compressed) {
    // get the decompressed size
    const decompressedSize = buffer.readUInt32();
    log.debug(`Uncompressed size: ${decompressedSize} bytes.`);

    // decompress LZX format
    if (compressionType == COMPRESSED_LZX_MASK) {
      // get the amount of data to compress
      const compressedTodo = fileSize - XNB_COMPRESSED_PROLOGUE_SIZE;
      // decompress the buffer based on the file size
      const decompressed = presser.decompress(buffer, compressedTodo);
      // copy the decompressed buffer into the file buffer
      buffer.copyFrom(
        decompressed,
        XNB_COMPRESSED_PROLOGUE_SIZE,
        0,
        decompressedSize,
      );
      // reset the byte seek head to read content
      buffer.bytePosition = XNB_COMPRESSED_PROLOGUE_SIZE;
    } // decompress LZ4 format
    else if (compressionType == COMPRESSED_LZ4_MASK) {
      // allocate buffer for LZ4 decode
      let trimmed = buffer.buffer.slice(XNB_COMPRESSED_PROLOGUE_SIZE);
      // decode the trimmed buffer into decompressed buffer
      const decompressed = lz4.decompress(trimmed);
      // copy the decompressed buffer into our buffer
      buffer.copyFrom(
        decompressed,
        XNB_COMPRESSED_PROLOGUE_SIZE,
        0,
        decompressedSize,
      );
      // reset the byte seek head to read content
      buffer.bytePosition = XNB_COMPRESSED_PROLOGUE_SIZE;
    }
  }

  log.debug(`Reading from byte position: ${buffer.bytePosition}`);

  // NOTE: assuming the buffer is now decompressed

  // get the 7-bit value for readers
  let count = buffer.read7BitNumber();
  // log how many readers there are
  log.debug(`Readers: ${count}`);

  // a local copy of readers for the export
  const readers: { type: string; version: number }[] = [];

  // loop over the number of readers we have
  const loadedReaders: Reader[] = [];
  for (let i = 0; i < count; i++) {
    // read the type
    const type = StringReader.read(buffer);
    // read the version
    const version = buffer.readInt32();

    // get the reader for this type
    const simpleType = simplifyType(type);
    const reader = getReader(simpleType);

    // add reader to the list
    loadedReaders.push(reader);
    // add local reader
    readers.push({ type, version });
  }

  // get the 7-bit value for shared resources
  const shared = buffer.read7BitNumber();

  // log the shared resources count
  log.debug(`Shared Resources: ${shared}`);

  // don't accept shared resources since SDV XNB files don't have any
  if (shared != 0) {
    throw new XnbError(`Unexpected (${shared}) shared resources.`);
  }

  // create content reader from the readers loaded
  const content = new ReaderResolver(loadedReaders);
  // read the content in
  const result = content.read(buffer);

  // we loaded the XNB file successfully
  log.info("Successfuly read XNB file!");

  // return the loaded XNB object
  return {
    header: {
      target,
      formatVersion,
      hidef,
      compressed,
    },
    readers,
    content: result,
  };
}

/** Converts JSON into an XNB buffer. */
export function pack(json: XnbJson) {
  // the output buffer for this file
  const buffer = new BufferWriter();

  // set the header information
  const target = json.header.target;
  const formatVersion = json.header.formatVersion;
  const hidef = json.header.hidef;
  const lz4Compression = (target == "a" || target == "i");
  const compressed = lz4Compression; // support android LZ4 compression

  const encoder = new TextEncoder();

  // write the header into the buffer
  buffer.write(encoder.encode("XNB"));
  buffer.write(encoder.encode(target));
  buffer.writeByte(formatVersion);
  // write the LZ4 mask for android compression only
  buffer.writeByte(
    hidef ? 1 : 0 | ((compressed && lz4Compression) ? COMPRESSED_LZ4_MASK : 0),
  );

  // write temporary filesize
  buffer.writeUInt32(0);

  // write the decompression size temporarily if android
  if (lz4Compression) {
    buffer.writeUInt32(0);
  }

  // write the amount of readers
  buffer.write7BitNumber(json.readers.length);

  // loop over the readers and load the types
  const readers = [];
  for (let reader of json.readers) {
    readers.push(getReader(simplifyType(reader.type))); // simplify the type then get the reader of it
    StringReader.write(buffer, reader.type, null);
    buffer.writeUInt32(reader.version);
  }

  // write 0 shared resources
  buffer.write7BitNumber(0);

  // create reader resolver for content and write it
  const content = new ReaderResolver(readers);

  // write the content to the reader resolver
  content.write(buffer, json.content);

  // trim excess space in the buffer
  // NOTE: this buffer allocates default with 500 bytes
  buffer.trim();

  // LZ4 compression
  if (lz4Compression) {
    // create buffer with just the content
    const contentBuffer = buffer.buffer.slice(XNB_COMPRESSED_PROLOGUE_SIZE);

    // create a buffer for the compressed data
    const compressed = lz4.compress(contentBuffer);
    const compressedSize = compressed.length;

    // write the decompressed size into the buffer
    buffer.dataView.setUint32(10, contentBuffer.length, true);
    // write the file size into the buffer
    buffer.dataView.setUint32(
      6,
      XNB_COMPRESSED_PROLOGUE_SIZE + compressedSize,
      true,
    );

    // create a new return buffer
    let returnBuffer = buffer.buffer.slice();

    // splice in the content into the return buffer
    returnBuffer.set(compressed, XNB_COMPRESSED_PROLOGUE_SIZE);

    // slice off the excess
    returnBuffer = returnBuffer.slice(
      0,
      XNB_COMPRESSED_PROLOGUE_SIZE + compressedSize,
    );

    // return the buffer
    return returnBuffer;
  }

  // write the file size into the buffer
  buffer.dataView.setUint32(6, buffer.buffer.length, true);

  // return the buffer
  return buffer.buffer;
}

/** Ensures the XNB file header is valid. */
function parseHeader(buffer: BufferReader) {
  // get the magic from the beginning of the file
  const magic = buffer.readString(3);
  // check to see if the magic is correct
  if (magic != "XNB") {
    throw new XnbError(
      `Invalid file magic found, expecting "XNB", found "${magic}"`,
    );
  }

  // debug print that valid XNB magic was found
  log.debug("Valid XNB magic found!");

  // load the target platform
  const target = buffer.readString(1).toLowerCase();

  // read the target platform
  switch (target) {
    case "w":
      log.debug("Target platform: Microsoft Windows");
      break;
    case "m":
      log.debug("Target platform: Windows Phone 7");
      break;
    case "x":
      log.debug("Target platform: Xbox 360");
      break;
    case "a":
      log.debug("Target platform: Android");
      break;
    case "i":
      log.debug("Target platform: iOS");
      break;
    default:
      log.warn(`Invalid target platform "${target}" found.`);
      break;
  }

  // read the format version
  const formatVersion = buffer.readByte();

  // read the XNB format version
  switch (formatVersion) {
    case 0x3:
      log.debug("XNB Format Version: XNA Game Studio 3.0");
      break;
    case 0x4:
      log.debug("XNB Format Version: XNA Game Studio 3.1");
      break;
    case 0x5:
      log.debug("XNB Format Version: XNA Game Studio 4.0");
      break;
    default:
      log.warn(`XNB Format Version ${log.h(formatVersion)} unknown.`);
      break;
  }

  // read the flag bits
  const flags = buffer.readByte();
  // get the HiDef flag
  const hidef = (flags & HIDEF_MASK) != 0;
  // get the compressed flag
  const compressed =
    ((flags & COMPRESSED_LZX_MASK) || (flags & COMPRESSED_LZ4_MASK)) != 0;
  // set the compression type
  // NOTE: probably a better way to do both lines but sticking with this for now
  const compressionType = (flags & COMPRESSED_LZX_MASK) != 0
    ? COMPRESSED_LZX_MASK
    : ((flags & COMPRESSED_LZ4_MASK) ? COMPRESSED_LZ4_MASK : 0);
  // debug content information
  log.debug(`Content: ${(hidef ? "HiDef" : "Reach")}`);
  // log compressed state
  log.debug(
    `Compressed: ${compressed}, ${
      compressionType == COMPRESSED_LZX_MASK ? "LZX" : "LZ4"
    }`,
  );

  return { target, formatVersion, hidef, compressed, compressionType };
}
