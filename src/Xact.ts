import * as path from "https://deno.land/std@0.66.0/path/mod.ts";
import AudioEngine from "./Xact/AudioEngine.ts";
import SoundBank from "./Xact/SoundBank.ts";
import XnbError from "./XnbError.ts";

// WaveBank Constants
const WBND_ENTRY_NAMES = 0x00010000; // bank includes entry names
const WBND_COMPACT = 0x00020000; // bank uses compact format
const WBND_SYNC_DISABLED = 0x00040000; // bank is disabled for audition sync
const WBND_SEEK_TABLES = 0x00080000; // bank includes seek tables
const WBND_MASK = 0x000F0000;

/**
 * Used to pack and unpack xact files
 * @class
 * @public
 */
class Xact {
  /**
     * Used to load a specific file.
     * @public
     * @static
     * @param {String} filename
     */
  static load(filename: string) {
    // get the extention name from the file
    const ext = path.extname(filename).toLowerCase().slice(1);

    // check our valid files
    switch (ext) {
      // AudioEngine
      case "xgs":
        // create instance of the audio engine
        const audioEngine = new AudioEngine();
        // load the audio engine file
        audioEngine.load(filename);
        break;
      case "xsb":
        SoundBank.load(filename);
        break;
      default:
        throw new XnbError(`Invalid file!`);
    }
  }
}

class Variable {
  name: string;
  value: number;
  isGlobal: boolean;
  isReadOnly: boolean;
  isPublic: boolean;
  isReserved: boolean;
  initValue: number;
  maxValue: number;
  minValue: number;

  constructor() {
    this.name = "";
    this.value = 0.0;

    this.isGlobal = false;
    this.isReadOnly = false;
    this.isPublic = false;
    this.isReserved = false;

    this.initValue = 0.0;
    this.maxValue = 0.0;
    this.minValue = 0.0;
  }
}

enum RpcPointType {
  Linear = 0,
  Fast = 1,
  Slow = 2,
  SinCos = 3,
}

class RpcPoint {
  x: number;
  y: number;
  type: number;

  constructor() {
    this.x = 0.0;
    this.y = 0.0;
    this.type = 0;
  }
}

enum RpcParmeter {
  Volume = 0,
  Pitch = 1,
  ReverbSend = 2,
  FilterFrequency = 3,
  FilterQFactor = 4,
}

class RpcCurve {
  variable: number;
  parameter: number;
  points: any[];

  constructor() {
    this.variable = 0;
    this.parameter = 0;
    this.points = [];
  }
}

class Segment {
  offset: number;
  length: number;

  constructor() {
    this.offset = 0;
    this.length = 0;
  }
}

class WaveBankEntry {
  format: number;
  playRegion: Segment;
  loopRegion: Segment;
  flagsAndDuration: number;

  constructor() {
    this.format = 0;
    this.playRegion = new Segment();
    this.loopRegion = new Segment();
    this.flagsAndDuration = 0;
  }
}

class WaveBankHeader {
  version: number;
  segments: Segment[];

  constructor() {
    this.version = 0;
    this.segments = [];
  }
}

class WaveBankData {
  flags: number;
  entryCount: number;
  bankName: string;
  entryMetaDataElementSize: number;
  entryNameElementSize: number;
  alignment: number;
  compactFormat: number;
  buildTime: number;

  constructor() {
    this.flags = 0;
    this.entryCount = 0;
    this.bankName = "";
    this.entryMetaDataElementSize = 0;
    this.entryNameElementSize = 0;
    this.alignment = 0;
    this.compactFormat = 0;
    this.buildTime = 0;
  }
}

export default Xact;
