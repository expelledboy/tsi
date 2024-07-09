import { Command } from "commander"

export type Flags = {
  git?: boolean
  install?: boolean
  importAlias?: string
}

export type CliArgs = {
  command: "help" | "dump" | "dry-run" | "apply"
  flags: Flags
}

const defaults: CliArgs = {
  command: "help",
  flags: {},
}

// https://github.com/tj/commander.js
export const addCommandFlags = (command: Command): Command =>
  command
    .option("--no-git", "Do not initialize a git repository", false)
    .option("--no-install", "Do not install dependencies after project setup", false)
    .option("--import-alias <alias>", "Custom import alias for project root", "~/")

export const parseCliArgs = (
  command: Command = addCommandFlags(new Command()),
  argv: string[] = process.argv,
): CliArgs => {
  const options = {
    ...defaults,
    flags: {
      ...defaults.flags,
      ...command.parse(argv).opts(),
    },
  }

  return options
}
