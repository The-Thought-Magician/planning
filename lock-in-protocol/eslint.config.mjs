import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**/*",
      "node_modules/**/*",
      "dist/**/*",
      "build/**/*",
      "out/**/*",
      ".vercel/**/*"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // TypeScript Rules - Catch build-breaking issues
      "@typescript-eslint/no-unused-vars": ["error", { 
        argsIgnorePattern: "^_", 
        varsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      
      // React Rules - Prevent runtime errors
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react/no-unescaped-entities": "error",
      "react/no-unknown-property": "error",
      "react/self-closing-comp": "error",
      "react/jsx-no-duplicate-props": "error",
      
      // General JavaScript Rules - Catch potential issues
      "no-unused-vars": "off", // Handled by TypeScript rule
      "no-undef": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-empty": "error",
      "no-extra-boolean-cast": "error",
      "no-func-assign": "error",
      "no-invalid-regexp": "error",
      "no-redeclare": "error",
      "no-sparse-arrays": "error",
      "use-isnan": "error",
      "valid-typeof": "error",
      
      // Import/Export Rules
      "import/no-unresolved": "off", // TypeScript handles this
      "import/named": "off", // TypeScript handles this
      "import/default": "off", // TypeScript handles this
      "import/no-unused-modules": "off", // Can be expensive
      
      // Code Quality Rules
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
    },
  },
];

export default eslintConfig;
