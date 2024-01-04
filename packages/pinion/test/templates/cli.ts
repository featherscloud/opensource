import { PinionContext, commander, Command, generator } from '../../lib/index.js'

interface Context extends PinionContext {
  name: string
}

const program = new Command()
  .description('A test command')
  .option('-n, --name <name>', 'Name of your project')

export const generate = (ctx: Context) =>
  generator(ctx)
    .then(commander(program))
    .then((ctx) => ({ ...ctx, noop: true }))
