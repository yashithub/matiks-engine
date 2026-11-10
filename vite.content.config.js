import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/content/index.js"),
      name: "MatiksCompanionContent",
      formats: ["iife"],
      fileName: () => "content.js"
    },
    outDir: "dist"
  }
});

