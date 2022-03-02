import { prompt, PromptModule } from 'inquirer'
import { loadModule } from './utils'

export interface Logger {
  warn: (msg: string) => void
  error: (msg: string) => void
  log: (msg: string) => void
}

export type Configuration = {
  cwd: string
  logger: Logger
  force: boolean
  prompt: PromptModule
  exec: (sh: string, args: string) => number
}

export type PinionContext = {
  cwd: string
  _?: string[]
  pinion: Configuration
}

export type ContextCallable<T, C extends PinionContext> = (ctx: C) => T|Promise<T>
export type Callable<T, C extends PinionContext> = T|ContextCallable<T, C>

export const getCallable = async <T, C extends PinionContext> (callable: Callable<T, C>, context: C) =>
  typeof callable === 'function' ? (callable as ContextCallable<T, C>)(context) : callable

export const mapCallables = <X, C extends PinionContext> (callables: Callable<X, C>[], context: C) =>
  Promise.all(callables.map(callable => getCallable(callable, context)))

export const getConfig = (initialConfig?: Partial<Configuration>) : Configuration => ({
  prompt,
  logger: console,
  cwd: process.cwd(),
  force: false,
  exec: (command: string, args: string) => {
    const spawn = require('execa')

    return spawn(command, args, {
      stdio: 'inherit'
    })
  },
  ...initialConfig
})

export const getContext = <T> (initialCtx: T, initialConfig: Partial<Configuration>) => {
  const pinion = getConfig(initialConfig)

  return {
    cwd: pinion.cwd,
    ...initialCtx,
    pinion
  } as PinionContext & T
}

export const generator = async <T extends PinionContext> (initialContext: T) => initialContext

export const runModule = async (file: string, ctx: PinionContext, fnName: string = 'generate') => {
  const module = await loadModule(file)
  const generate = module[fnName]

  return generate(ctx)
}

export const run = async <T> (file: string, initialCtx: T, initialConfig: Partial<Configuration> = {}) => {
  const ctx = getContext(initialCtx, initialConfig)

  return runModule(file, ctx)
}