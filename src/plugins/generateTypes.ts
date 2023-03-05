import { dtsPlugin } from 'esbuild-plugin-d.ts'

export type TGenerateTypes = {
  outDir?: string
  tsconfig?: string
}

export const generateTypes = (conf:TGenerateTypes) => dtsPlugin(conf)





