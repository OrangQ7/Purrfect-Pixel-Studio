import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "**/.next/**",
      ".tmp-chrome-cdp*/**",
      "**/.tmp-chrome-cdp*/**",
      "node_modules/**",
      "**/node_modules/**",
      "test-results/**",
      "**/test-results/**",
    ],
  },
  ...nextVitals,
  ...nextTs,
];

export default eslintConfig;
