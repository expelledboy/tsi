import { fs as memfs, vol } from "memfs"
import { dump, apply } from "./cmds"
import { Codec, Files, Config as mkConfig } from "./design"
import { onlyKeyInObject, toJsonStr } from "./utils"

// context

const root = "/project"
const configData = { feature: true }
const configFile = "config.json"
const configPath = `${root}/${configFile}`

const parsers = {
  config: {
    use: (path) => path === configPath,
    parse: (content) => JSON.parse(content) as typeof configData,
    serialize: (data) => JSON.stringify(data, null, 2),
  } as Codec<typeof configData>,
}

type Config = mkConfig<typeof parsers>

const transforms: Config["transforms"] = [(state: Files<typeof parsers>) => state]

const config: Config = { cwd: root, parsers, transforms }

// setup

const log = jest.spyOn(console, "log").mockImplementation(() => void 0)

jest.mock("fs/promises", () => memfs.promises)

beforeAll(() => {
  vol.fromJSON({ [configPath]: toJsonStr(configData) }, root)
})

afterEach(() => {
  jest.clearAllMocks()
})

// tests

test("dump", async () => {
  await dump(config)

  expect(log).toHaveBeenCalledWith(
    toJsonStr({ [configPath]: { [onlyKeyInObject(parsers)]: configData } }),
  )
})

test("apply", async () => {
  await apply(config)
})

