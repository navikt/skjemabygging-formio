import typescript from "@rollup/plugin-typescript";
import shebang from "rollup-plugin-preserve-shebang";

const config = [
  {
    input: "src/pusher-message/trigger-workflow-message.ts",
    output: {
      dir: "dist",
      format: "es",
      sourcemap: true,
      entryFileNames: "[name].mjs",
    },
    external: ["fs", "pusher"],
    plugins: [
      typescript({
        exclude: ["**/*.test.ts", "**/__mocks__/**"],
      }),
      shebang(),
    ],
  },
];

export default config;
