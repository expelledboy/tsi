import { fs as memfs, vol } from "memfs"
import { run } from "./design"
import { deps } from "./ioc"

type System = Parameters<ReturnType<typeof run>>[0]

jest.mock("fs", () => memfs)
jest.mock("fs/promises", () => memfs.promises)

const fileSystem: Record<string, string> = {
  "/project/package.json": JSON.stringify({ name: "example" }),
}

const packageLoader = {
  isInterested: (path: string) => path.endsWith("package.json"),
  parse: (content: string) => JSON.parse(content),
}

const loaders = { package: packageLoader }

const system: System = {
  loadConfig: jest.fn().mockResolvedValue({ loaders }),
  stateLoader: jest.fn().mockReturnValue({
    loadState: jest.fn().mockResolvedValue({
      "/project/package.json": { package: { name: "example" } },
    }),
  }),
  plan: jest.fn().mockResolvedValue([]),
  apply: jest.fn().mockReturnValue(jest.fn().mockResolvedValue(void 0)),
}

beforeAll(() => {
  vol.fromJSON(fileSystem, "/project")
})

test("run", async () => {
  await run(deps)(system)("/project")

  expect(system.loadConfig).toHaveBeenCalled()
  expect(system.stateLoader).toHaveBeenCalled()
  expect(system.plan).toHaveBeenCalled()
  expect(system.apply).toHaveBeenCalled()
})
