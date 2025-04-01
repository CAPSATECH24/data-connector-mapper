
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Copy SQL.js WASM file to public folder
  const sqlWasmSrc = 'node_modules/sql.js/dist/sql-wasm.wasm';
  const sqlWasmDest = 'public/sql-wasm.wasm';
  
  if (fs.existsSync(sqlWasmSrc) && !fs.existsSync(sqlWasmDest)) {
    fs.copyFileSync(sqlWasmSrc, sqlWasmDest);
    console.log('✅ SQL.js WASM file copied to public folder');
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
