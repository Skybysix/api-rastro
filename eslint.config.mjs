
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  // Carpetas que no se revisan
  { ignores: ["dist/", "coverage/", "node_modules/"] },

  // Reglas recomendadas de ESLint y de TypeScript
  js.configs.recommended,
  tseslint.configs.recommended,

  // El código se ejecuta en Node.js
  {
    languageOptions: {
      globals: globals.node,
    },
  },

  // Nuestras reglas
  {
    rules: {
      eqeqeq: "error",
      "no-var": "error",
      "prefer-const": "error",
      "no-empty": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
);
