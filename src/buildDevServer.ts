import type { SpawnOptions } from 'child_process'
import type {
  TNMOpts,
  TDevServer,
  TESBuildConf,
  TESWatchConf,
} from './types'


import path from 'path'
import { spawn } from 'child_process'
import {
  isArr,
  noOpObj,
  eitherObj,
  eitherArr,
  flatUnion,
  emptyArr,
  emptyObj,
} from '@keg-hub/jsutils'

const getEnvs = (envs:NodeJS.ProcessEnv, merge:boolean) => {
  
  const envObj =  eitherObj(envs, noOpObj)
  if(!merge) return envObj as NodeJS.ProcessEnv

  return {
    ...(merge ? process.env : noOpObj),
    ...envObj,
  } as NodeJS.ProcessEnv
}


const nodemonDefArgs = (outFile:string, configPath:string) => ([
  `--config`,
  configPath || path.join(__dirname, `nm.config.json`),
  `--ignore`,
  `**/*`,
  `--exec`,
  `node`,
  `--enable-source-maps`,
  `-r`,
  `esbuild-register`,
  outFile
])

const getArgs = (
  outFile:string,
  nodemonOpts?:TNMOpts,
  nmArgs?:string[],
) => {
  const { merge, args, configPath, } = nodemonOpts

  const mergeArgs = isArr(nmArgs)
    ? flatUnion(nmArgs, args)
    : isArr(args) && args

  const defArgs = nodemonDefArgs(outFile, configPath)

  return merge
    ? flatUnion<string>(defArgs, mergeArgs)
    : eitherArr<string[]>(mergeArgs, defArgs)
}

const onProcessExit = (devServer:TDevServer) => {
  return () => {
    devServer.server
      && devServer.server.pid
      && process.kill(devServer.server.pid)

    devServer.ctx
      && devServer.ctx.dispose()

    devServer.ctx = undefined
    devServer.server = undefined
  }
}

/**
 * Helper to start the dev server after bundling the app
 */
export const buildDevServer = (config:TESBuildConf, noDevServer:boolean) => {
  const { cwd, outFile, envs, mergeEnvs, args, nodemonOpts } = config

  const nmArgs = getArgs(outFile, eitherObj<TNMOpts>(nodemonOpts, noOpObj), args)

  const devServer = (async () => {
    if (noDevServer) return

    devServer.server = spawn('nodemon', nmArgs, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      env: getEnvs(
        eitherObj<NodeJS.ProcessEnv>(envs as NodeJS.ProcessEnv, noOpObj as NodeJS.ProcessEnv),
        mergeEnvs
      ),
    })

    devServer.server.stdout.on('data', (data:string) => process.stdout.write(data))
    devServer.server.stderr.on('data', (data:string) => process.stderr.write(data))
    process.on(`exit`, onProcessExit(devServer))
  }) as unknown as TDevServer

  return devServer
}

const buildWatchArgs = (config:TESWatchConf) => {
  const {
    cwd,
    envs,
    file,
    outDir,
    outFile,
    watchDir,
    node=emptyArr,
    spawn=emptyObj,
  }  = config

  if(!file && !outFile)
    throw new Error(`eswatch requires specifying a file. Use the "file" or "outFile" arguments to set file path`)

  const folder = watchDir || outDir
  const args = !folder
    ? [...node, `--watch`, file || outFile]
    : [...node, `--watch-path`, folder, file || outFile]

  return {
    args,
    opts: {
      cwd,
      envs,
      stdio: `inherit`,
      ...spawn
    }
  }
}

export const buildNodeDevServer = (config:TESWatchConf) => {
  const { args, opts } = buildWatchArgs(config)

  const devServer = (async () => {
    devServer.server = spawn(`node`, args, opts as SpawnOptions)
    process.on(`exit`, onProcessExit(devServer))
  }) as unknown as TDevServer

  return devServer
}