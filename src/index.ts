import { dump } from "./cmds"
import { config } from "./config"

const parseArgs = (): (() => Promise<void>) => {
  const cmd = process.argv[2]

  switch (cmd) {
    case "dump":
      return () => dump(config)
    default:
      return async () => console.log("Unknown command")
  }
}

async function main() {
  const cmd = parseArgs()
  await cmd()
}

main()
