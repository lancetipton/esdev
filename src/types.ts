import type { ChildProcess } from 'child_process'
import type {
  Plugin,
  BuildResult,
  BuildOptions,
  BuildFailure,
} from 'esbuild'


export type TDevServer = (() => void) & {
  server?: ChildProcess
}

export type TNMOpts = {
  args?:string[]
  merge?:boolean
  configPath?:string
}

export type TESBuildConf = BuildOptions & {
  cwd:string
  dev?:boolean
  outFile:string
  args?:string[]
  entryFile?:string
  mergeEnvs?:boolean
  plugins?: Plugin[]
  nodemonOpts?:TNMOpts
  entryPoints?:string[]
  aliases?:Record<string, string>
  envs?:Record<string, string|number|boolean>
  onRebuild?:(error:BuildFailure, result:BuildResult) => void
}
