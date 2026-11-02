// eslint.config.mjs — @nself/ntask-cli
// Flat config (ESLint v9+). typescript-eslint recommended ruleset, same as packages/@nself-web/csp.
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  { ignores: ["dist/", "node_modules/"] },
);
