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

## License
GNU GPL v3.0
