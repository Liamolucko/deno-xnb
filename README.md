# deno-xnb
This is a Deno port of [LeonBlade/xnbcli](https://github.com/LeonBlade/xnbcli), with a few additions.

## CLI
### Requirements
- [Deno](https://deno.land/)

### Installation
`deno install --allow-read --allow-write -n xnbcli https://denopkg.com/Liamolucko/deno-xnb/cli.ts`

### Usage
`xnbcli (pack|unpack) [input] [output]`

## Module
```typescript
import * as xnb from "https://denopkg.com/Liamolucko/deno-xnb/mod.ts";

const helloWorld = xnb.pack({
  header: {
    target: "w",
    hidef: true,
    formatVersion: 5,
    compressed: true,
  },
  readers: [{
    type: "Microsoft.Xna.Framework.Content.StringReader",
    version: 0,
  }],
  content: "Hello, World!",
});

console.log(xnb.unpack(helloWorld).content); // Hello, World!
```

### Register custom readers
```typescript
import * as xnb from "https://denopkg.com/Liamolucko/deno-xnb/mod.ts";
// All of the built-in readers are exported from readers.ts for custom readers to build on.
import { BooleanReader } from "https://denopkg.com/Liamolucko/deno-xnb/readers.ts";

const FooReader = {
  // Functions for 'ReaderConstructor'.

  // This should check whether `type` is the corresponding _reader_.
  is(type: xnb.Type) {
    return type.name === "Foo.FooReader";
  },

  // This should check whether `type` is the type this reader _reads_.
  reads(type: xnb.Type) {
    return type.name === "Foo.Foo";
  },

  // While in this case the class is a singleton and can just return itself,
  // in cases such as ListReader it does need to create an instance.
  // In those cases, you can accept an `xnb.Type` parameter and use its generics to consruct the class.
  fromType() {
    return this;
  },

  // This is used to find the index of the type and write it.
  type: new xnb.Type({ name: "Foo.FooReader" }),

  isPolymorphic: false,

  readFrom(buffer: xnb.BinaryReader) {
    return BooleanReader.readFrom(buffer) ? "Foo" : "Bar";
  },

  writeTo(buffer: xnb.BinaryWriter, value: "Foo" | "Bar") {
    return BooleanReader.writeTo(buffer, value === "Foo");
  },
};

xnb.register(FooReader);
```

# Original README

A CLI tool for XNB packing/unpacking purpose built for Stardew Valley.

This tool currently supports unpacking all LZX compressed XNB files for Stardew Valley.  
There is some basic groundwork for XACT as well.

The end goal for this project is to serve as a CLI for a GUI wrapper to leverage so the average user can interface with
XNB files a lot easier.

## Usage

**Unpacking XNB files**

Place any files you wish to extract in the `packed` folder and run the appropriate file for unpacking.  `unpack.bat`, `unpack.command` or `unpack.sh`.

**Packing XNB files**

Place any files you wish to repack back into XNB files in the `unpacked` folder and run the appropriate file for packing.  `pack.bat`, `pack.command` or `pack.sh`.

**Terminal Use**

`xnbcli (pack|unpack) [input] [output]`

## Developers

If you wish to run this with Node.js and all the source code, please refer to the following.

- `node.js` installed
- `npm` installed
- `python` installed
- (for Windows users) `windows-build-tools` installed (`npm i --g --production windows-build-tools`)
- Run `npm install` to install node packages.
- `npm run unpack` and `npm run pack` scripts are available for use in the `package.json` file.

## License
GNU GPL v3.0
