import { Context } from "~/design"
import { codecs } from "~/codecs"
import { extensions } from "~/extensions"
import { parseCliArgs } from "./cliArgs"
import { parseEnv } from "./env"

export const parseContext = (): Context<typeof codecs> => {
  const env = parseEnv()
  const cliArgs = parseCliArgs()

  const first = (...args: any[]) => args.find((v) => v !== undefined)
  const not = <T>(v: T): undefined | boolean => (v === undefined ? undefined : !v)

  return {
    cwd: process.cwd(),
    codecs,
    extensions,
    command: cliArgs.command,
    options: {
      git: first(not(env.TSI_NO_GIT), cliArgs.flags.git, true),
      install: first(not(env.TSI_NO_INSTALL), cliArgs.flags.install, true),
    },
  }
}
