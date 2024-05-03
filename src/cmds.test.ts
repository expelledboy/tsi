import { fs as memfs, vol } from "memfs"
import { dump } from "./cmds"
import { parsers } from "./parsers"

jest.mock("fs/promises", () => memfs.promises)

const root = "/project"

const log = jest.spyOn(console, "log").mockImplementation(() => void 0)

const config = {
  package: { name: "example" },
}

const fileConfig: Record<string, keyof typeof config> = {
  [`${root}/package.json`]: "package",
}

const fileSystem = Object.fromEntries(
  Object.entries(fileConfig).map(([path, content]) => [
    path,
    JSON.stringify(config[content]),
  ]),
)

const state = JSON.stringify(
  Object.fromEntries(
    Object.entries(fileConfig).map(([path, content]) => [
      path,
      { nodePackage: config[content] },
    ]),
  ),
  null,
  2,
)

beforeAll(() => {
  vol.fromJSON(fileSystem, root)
})

afterEach(() => {
  jest.clearAllMocks()
})

test("dump", async () => {
  await dump({ cwd: root, parsers, transforms: [] })
  expect(log).toHaveBeenCalledWith(state)
})
