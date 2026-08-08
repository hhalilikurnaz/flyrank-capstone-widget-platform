import { build } from "esbuild";
import path from "node:path";
import { WIDGET_SDK_VERSION } from "./version";

async function main() {
  const outfile = path.resolve(__dirname, `../../public/widgets/widget.${WIDGET_SDK_VERSION}.js`);
  await build({
    entryPoints: [path.resolve(__dirname, "embed.ts")],
    bundle: true,
    minify: true,
    format: "iife",
    target: "es2018",
    outfile,
  });
  console.log(`Built widget SDK -> ${outfile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
