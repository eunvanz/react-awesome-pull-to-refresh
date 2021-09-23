import pkg from "./package.json";
import babel from "rollup-plugin-babel";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

const extensions = [".js", ".jsx", ".ts", ".tsx", ".scss"];

process.env.BABEL_ENV = "production";

export default [
  {
    input: pkg.source,
    output: [
      {
        file: pkg.module,
        sourcemap: true,
        format: "es",
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve({ extensions }),
      commonjs({
        include: /node_modules/,
      }),
      postcss({
        extract: true,
        sourceMap: true,
        use: ["sass"],
      }),
      babel({ extensions, include: ["src/**/*"], runtimeHelpers: true }),
      terser(),
    ],
    external: ["react", "react-dom"],
  },
];
