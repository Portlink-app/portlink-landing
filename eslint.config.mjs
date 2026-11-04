import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Netlify's local build output. .gitignore already excludes it, but a flat
    // eslint config does not read .gitignore, so `npm run lint` in a checkout
    // that has ever built produced 100+ errors from vendored bundles.
    ".netlify/**",
    // Vendored third-party bundles (three.js r-min builds, licence alongside).
    // They ship byte-for-byte as published and are not our source.
    "public/**/*.min.js",
  ]),
  {
    // CommonJS scripts load dependencies with require() by definition.
    files: ["**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);

export default eslintConfig;
