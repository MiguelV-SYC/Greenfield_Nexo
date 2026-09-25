import sonarjs from "eslint-plugin-sonarjs"
import tseslint from "typescript-eslint"

export default tseslint.config(
  { ignores: ["dist/**", "coverage/**", "src/generated/**", "*.config.js"] },
  ...tseslint.configs.recommended,
  sonarjs.configs.recommended,
  {
    rules: {
      // stack/constraints.md: sin console.log (nestjs-pino) y sin any.
      "no-console": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
)
