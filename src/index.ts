import { dump, apply } from "./cmds"

const help = async () => console.log("Usage: tsi <dump|apply>")

const unknown = async () => console.error("Unknown command")

const parseArgs = (): (() => Promise<void>) => {
  switch (process.argv[2]) {
    case "dump":
      return dump
    case "apply":
      return apply
    case "help":
      return help
    default:
      return unknown
  }
}

async function main() {
  const cmd = parseArgs()

  await cmd()
}

main()
