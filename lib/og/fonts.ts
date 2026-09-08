import { readFile } from "node:fs/promises";

function fontUrl(name: string) {
  return new URL(`./fonts/${name}`, import.meta.url);
}

const fontsPromise = Promise.all([
  readFile(fontUrl("PlusJakartaSans-Bold.ttf")),
  readFile(fontUrl("PlusJakartaSans-ExtraBold.ttf")),
  readFile(fontUrl("JetBrainsMono-Bold.ttf")),
]).then(([jakartaBold, jakartaExtraBold, monoBold]) => [
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
]);

export async function loadOgFonts() {
  return fontsPromise;
}
