import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";

const commonPlugins = [
  resolve(),
  commonjs(),
  json(),
];

const external = ["fs", "path", "react", "next-mdx-remote", "remark", "rehype", "gray-matter"];

const onwarn = (warning, warn) => {
  if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
  warn(warning);
};

export default [
  {
    input: "core/engine/index.ts",
    output: {
      dir: "dist/cjs",
      format: "cjs",
      sourcemap: true,
      entryFileNames: "[name].js",
    },
    external,
    plugins: [
      ...commonPlugins,
      typescript({ 
        tsconfig: "./tsconfig.json", 
        declaration: true, 
        declarationDir: "dist/cjs",
        compilerOptions: {
            incremental: false,
            tsBuildInfoFile: null
        }
      }),
    ],
    onwarn,
  },
  {
    input: "core/engine/index.ts",
    output: {
      dir: "dist/esm",
      format: "esm",
      sourcemap: true,
      entryFileNames: "[name].js",
    },
    external,
    plugins: [
      ...commonPlugins,
      typescript({ 
        tsconfig: "./tsconfig.json", 
        declaration: true, 
        declarationDir: "dist/esm",
        compilerOptions: {
            incremental: false,
            tsBuildInfoFile: null
        }
      }),
    ],
    onwarn,
  },
];
