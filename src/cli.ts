import { Command } from "commander"
import * as constants from "./constants"

export type CliArgs = {
  command:
    | { type: "dump" }
    | { type: "dry-run"; out: "fake" | "args" | "todo" | "remove" }
    | { type: "apply" }
  flags: {
    verbose?: boolean
    format: "json" | "text" | "yaml"
  }
}

export async function cli(argv: string[] = process.argv) {
  const program = new Command()
    .name(constants.APP)
    .description(constants.APP_DESCRIPTION)
    .option("--verbose", "Verbose output", false)
    .option("--format <format>", "Output format", "json")

  program.command("dump").description("Dump the current state of the project")

  program
    .command("dry-run")
    .description("Show what operations will be run")
    .option("--out <out>", "Output format", "fake")

  program.command("apply").description("Apply all installed transformations")

  await program.parseAsync(argv)
}
