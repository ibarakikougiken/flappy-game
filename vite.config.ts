import { defineConfig } from "vite";

export default defineConfig({
  base: "/flappy-game/",
  build: {
    minify: "esbuild",
  },
});
