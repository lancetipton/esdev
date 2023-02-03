import type {
  TNMOpts,
  TDevServer,
  TESBuildConf,
} from './types'

import path from 'path'
import { spawn } from 'child_process'
import { ESBRoot } from '../resolveRoot'
import {
  isArr,
  noOpObj,
  eitherObj,
  eitherArr,
  flatUnion,
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
  configPath || path.join(ESBRoot, `configs/nm.config.json`),
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

/**
 * Helper to start the dev server after bundling the app
 */
export const buildDevServer = (config:TESBuildConf, noDevServer:boolean) => {
  const { cwd, outFile, envs, mergeEnvs, args, nodemonOpts } = config

  const nmArgs = getArgs(outFile, eitherObj<TNMOpts>(nodemonOpts, noOpObj), args)

  const devServer = (async () => {
    if (noDevServer) return

    // @ts-ignore
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
    process.on(`exit`, () => (
      devServer.server
        && devServer.server.pid
        && process.kill(devServer.server.pid)
    ))
  }) as TDevServer

  return devServer
}
