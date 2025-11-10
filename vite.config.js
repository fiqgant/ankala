import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 768,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("firebase")) return "firebase";
            if (id.includes("@radix-ui")) return "radix";
            if (
              id.includes("react-router-dom") ||
              id.includes("react-dom") ||
              id.includes("react/jsx-runtime")
            ) {
              return "react-vendors";
            }
            if (id.includes("lucide-react") || id.includes("react-icons")) {
              return "icons";
            }
            if (
              id.includes("@google/generative-ai") ||
              id.includes("openai")
            ) {
              return "ai-sdks";
            }

            return "vendor";
          }
        },
      },
    },
  },
})
