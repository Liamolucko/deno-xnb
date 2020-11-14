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
    env: {
      "NO_COLOR": "1",
    },
  });

  const output = new TextDecoder().decode(await process.output());

  const errors = Array.from(
    output.matchAll(/\[ERROR\]((?:.|\n)+?)(?=\n\[|$)/g),
  ).map((err) => err[0]);

  if (!(await process.status()).success) {
    throw new Error("CLI failed");
  } else if (
    errors.filter((err) =>
      // These errors are expected
      !err.split("\n")[1].startsWith("XnbError: Invalid reader type")
    ).length > 0
  ) {
    throw new Error(
      `CLI logged error(s):\n    ${errors.join("\n    ")}`,
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
