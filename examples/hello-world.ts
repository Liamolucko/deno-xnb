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
