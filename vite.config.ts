import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // supabase-js is on every page; in a chunk of its own it stays cached across deploys
        // instead of riding along with whichever app module first imported it.
        codeSplitting: {
          groups: [{ name: "supabase", test: /node_modules[\\/]@supabase[\\/]/ }],
        },
      },
    },
  },
});
