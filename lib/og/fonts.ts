import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

type OgFont = {
  name: string;
  data: Buffer;
  weight: 700 | 800;
  style: "normal";
};

function fontPath(url: URL) {
  const href = url.href;
  return href.startsWith("file:") ? fileURLToPath(href) : href;
}

async function readFont(url: URL) {
  return readFile(fontPath(url));
}

let fontsPromise: Promise<OgFont[]> | undefined;

async function loadOgFontFiles() {
  const [jakartaBold, jakartaExtraBold, monoBold] = await Promise.all([
    readFont(new URL("./fonts/PlusJakartaSans-Bold.ttf", import.meta.url)),
    readFont(new URL("./fonts/PlusJakartaSans-ExtraBold.ttf", import.meta.url)),
    readFont(new URL("./fonts/JetBrainsMono-Bold.ttf", import.meta.url)),
  ]);

  return [
    {
      name: "Jakarta",
      data: jakartaBold,
      weight: 700 as const,
      style: "normal" as const,
    },
    {
      name: "Jakarta",
      data: jakartaExtraBold,
      weight: 800 as const,
      style: "normal" as const,
    },
    {
      name: "JetBrains Mono",
      data: monoBold,
      weight: 700 as const,
      style: "normal" as const,
    },
  ];
}

export async function loadOgFonts() {
  fontsPromise ??= loadOgFontFiles();
  return fontsPromise;
}
