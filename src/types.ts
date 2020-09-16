import ReaderManager from "./reader-manager.ts";
import { BinaryReader } from "./binary.ts";
import { BinaryWriter } from "../mod.ts";

const subtypeRegex = /\[(([a-zA-Z0-9\.\,\=\`]+)(\[\])?(\, |\])){1,}/g;

export class Type {
  /** The full name of the type. */
  name: string;
  /** The subtypes of the type. */
  subtypes: Type[];
  /** Whether the type is an array. Assumed false if not given. */
  isArray: boolean;

  constructor(opts: { name: string; subtypes?: Type[]; isArray?: boolean }) {
    this.name = opts.name;
    this.subtypes = opts.subtypes ?? [];
    this.isArray = opts.isArray ?? false;
  }

  /** Parses a .NET assembly type, which is how they're encoded in XNB. */
  static fromString(type: string): Type {
    // split the string by the ` after the type
    const split = type.split("`");
    const name = split[0].split(",")[0];
    const subtypes = split[1]
      ?.slice(2, -1)
      .match(subtypeRegex)
      ?.map((e) => Type.fromString(e.slice(1, -1)));

    return new Type({
      name,
      subtypes,
      isArray: name.endsWith("[]"),
    });
  }

  toString(): string {
    return `${this.name}\`${this.subtypes.length}[${
      this.subtypes
        .map((type) => `[${type.toString()}]`)
        .join(",")
    }]`;
  }

  equals(other: Type): boolean {
    return this.name === other.name &&
      this.subtypes.every((type, i) => type.equals(other.subtypes[i])) &&
      this.isArray === other.isArray;
  }
}

export interface ExportlessReader<T> {
  /** 
   * Whether this type could be substituted by a subclass, or it's this type specifically.
   * 
   * This determines whether the reader's index is included in things like `List` and `Dictionary`.
   */
  readonly isPolymorphic: boolean;

  /** 
   * The type of the reader (the reader itself, not the type it reads).
   * 
   * Used to find its index in ReaderManager.
   */
  readonly type: Type;

  /**
   * Reads a value from a buffer.
   * @param buffer The buffer to read from.
   * @param manager The set of readers to resolve readers from, which also allows access to the logger.
   * @returns The type as specified by the type reader.
   */
  readFrom(buffer: BinaryReader, manager: ReaderManager): T;

  /**
   * Writes into the buffer.
   * @param buffer The buffer to write to.
   * @param data The data to write to the stream.
   * @param manager ReaderManager to write indexes of sub-readers, which also allows access to the logger.
   */
  writeTo(
    buffer: BinaryWriter,
    content: T,
    manager: ReaderManager,
  ): void;
}

export interface ReaderWithExports<T, E = T> extends ExportlessReader<T> {
  /** 
   * Exports read value into a format suitable for JSON serialization. If not provided, JSON.stringify will be used.
   * 
   * This is only called on the top-level content, which is then responsible for calling it on its children.
   * So if you're making something like a `ListReader`, make sure to call `export` manually on its children.
   * 
   * To export files along with the json, use `exportFile`.
   * 
   * @param exportFile
   * Exports a file with given data and extension, and returns the exported filename. 
   * You should probably save this in the exported json somewhere so you can retrieve it in `import`.
   */
  export(
    value: T,
    exportFile: (data: Uint8Array, extension: string) => string,
  ): E;

  /** Imports value as exported by `export` back into read value. If not provided, JSON.parse will be used. */
  import(value: E, importFile: (filename: string) => Uint8Array): T;
}

type Exportless = "dnsmaeebsb";

/** An XNB ContentReader. */
export type Reader<T, E = Exportless> = E extends Exportless
  ? ExportlessReader<T>
  : ReaderWithExports<T, E>;

/** Convenience type for if your reader is a singleton. */
export type SingletonReader<T, E = Exportless> =
  & ReaderConstructor<T, E>
  & Reader<T, E>;

/** A 'constructor' for readers that checks for the correct type and returns an instance with the necessary generics. */
export interface ReaderConstructor<T, E = Exportless> {
  /** Checks whether `type` is the corresponding reader. */
  is(type: Type): boolean;

  /** Checks whether `type` is the type this reader reads. */
  reads(type: Type): boolean;

  /** 
   * Returns an instance of the corresponding reader. 
   * 
   * If this reader is always the same, it can just return the same object, 
   * but in many cases you'll need `type` for the generic parameters. 
   */
  fromType(type: Type): Reader<T, E>;
}
