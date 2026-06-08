import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        loader: "loader.html",
        experience: "experience.html",
        error404: "404.html",
      },
    },
  },
});
