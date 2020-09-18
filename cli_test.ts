import * as path from "https://deno.land/std@0.69.0/path/mod.ts";

async function testCli(...options: string[]) {
  const process = Deno.run({
    cmd: [
      "deno",
      "run",
      "--allow-read",
      "--allow-write",
      "cli.ts",
      ...options,
    ],
    stdout: "piped",
    cwd: path.dirname(path.fromFileUrl(import.meta.url)),
  });

  const output = new TextDecoder().decode(await process.output());

  if (!(await process.status()).success) {
    throw new Error("CLI failed");
  } else if (output.includes("[ERROR]")) {
    throw new Error(
      `CLI logged error(s):\n    ${
        Array.from(output.matchAll(/\[ERROR\](.+)$/gm)).join("\n    ")
      }`,
    );
  }

  process.close();
}

Deno.test({
  name: "CLI on packed/*",
  async fn() {
    await testCli("unpack", "packed", "unpacked");
    await testCli("pack", "unpacked", "packed");
    await testCli("unpack", "packed", "unpacked");
  },
});
