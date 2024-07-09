import { Context, Operation } from "./design"
import { environment, requireBins } from "./ioc"
import { engine } from "./engine"
import { codecs } from "./codecs"
import * as constants from "./constants"

import { Command } from "commander"

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

export async function main(context: Context<typeof codecs>) {
  await requireBins()

  const project = engine(environment)(context)

  switch (context.command) {
    case "dump": {
      const state = await project.loadState()
      const dump = { context: project.context, files: state }
      console.log(JSON.stringify(dump, null, 2))
    }
    case "dry-run": {
      const state = Object.freeze(await project.loadState())
      const transformed = project.transform(state)
      const ops = await project.plan(state, transformed)
      ops.forEach(printOp)
    }
    case "apply": {
      const state = Object.freeze(await project.loadState())
      const transformed = project.transform(state)
      const ops = await project.plan(state, transformed)
      await project.apply(ops)
    }
    default: {
      console.log("help")
    }
  }
}

// --

const printOp = (op: Operation) => {
  switch (op.type) {
    case "write":
      console.log(`write ${op.path}\n`, op.content.trimEnd())
    case "remove":
      console.log(`rm ${op.path}`)
    case "ignore":
      console.log(`git ignore ${op.path}`)
    case "gitInit":
      console.log(`git init`)
  }
}
