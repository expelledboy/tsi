import { dump, apply, dryRun } from "./cmds"
import { requireBins } from "./ioc"

const help = async () => console.log("Usage: tsi <dump|apply>")

const unknown = async () => console.error("Unknown command")

const parseArgs = (): (() => Promise<void>) => {
  switch (process.argv[2]) {
    case "dump":
      return dump
    case "dry-run":
      return dryRun
    case "apply":
      return apply
    case "help":
      return help
    default:
      return unknown
  }
}

async function main() {
  await requireBins()

  const cmd = parseArgs()

  await cmd()
}

main()
