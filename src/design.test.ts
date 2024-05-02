import { fs as memfs, vol } from "memfs"
import { run } from "./design"
import { deps } from "./ioc"
import { system } from "./system"

jest.mock("fs", () => memfs)
jest.mock("fs/promises", () => memfs.promises)

const root = "/project"

const fileSystem: Record<string, string> = {
  [`${root}/package.json`]: JSON.stringify({ name: "example" }),
}

const loadConfig = jest.spyOn(system, "loadConfig")
const stateLoader = jest.spyOn(system, "stateLoader")
const plan = jest.spyOn(system, "plan")
const apply = jest.spyOn(system, "apply")

beforeAll(() => {
  vol.fromJSON(fileSystem, root)
})

beforeEach(() => {
  jest.clearAllMocks()
})

test("run", async () => {
  const main = run(deps, system)

  await main(root)

  expect(loadConfig).toHaveBeenCalled()
  expect(stateLoader).toHaveBeenCalled()
  expect(plan).toHaveBeenCalled()
  expect(apply).toHaveBeenCalled()
})
