import * as path from "https://deno.land/std@0.69.0/path/mod.ts";
import { assertEquals } from "https://deno.land/std@0.69.0/testing/asserts.ts";

const tests = [
  {
    file: "hello-world.ts",
    expected: "Hello, World!\n",
  },
  {
    file: "foo-reader.ts",
    expected: "Foo\n",
  },
];

for (const test of tests) {
  Deno.test({
    name: `examples/${test.file}`,
    async fn() {
      const process = Deno.run({
        cmd: ["deno", "run", test.file],
        stdout: "piped",
        cwd: path.dirname(path.fromFileUrl(import.meta.url)),
      });

      const output = new TextDecoder().decode(await process.output());
      process.close();

      assertEquals(output, test.expected);
    },
  });
}
