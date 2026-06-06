import baseConfig from "@veloxlane/config/eslint";

export default [
  ...baseConfig,
  {
    ignores: ["metro.config.cjs", "tailwind.config.js", "babel.config.cjs"],
  },
];
