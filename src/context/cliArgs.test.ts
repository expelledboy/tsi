import { Command } from "commander"
import { addCommandFlags, parseCliArgs } from "./cliArgs"

test("parseCliArgs", () => {
  const command = addCommandFlags(new Command())
  const args = parseCliArgs(command, [
    "node",
    "tsi",
    "--no-git",
    "--import-alias",
    "src/",
  ])

  expect(args).toEqual({
    command: "help",
    flags: {
      git: false,
      install: false,
      importAlias: "src/",
    },
  })
})
