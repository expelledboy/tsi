import { fs as memfs, vol } from "memfs"
import { dump, apply } from "./cmds"
import { Codec, Files, Config as mkConfig } from "./design"
import { onlyKeyInObject, toJsonStr } from "./utils"

// context

const root = "/project"
const configData = { feature: true }
const newConfigData = { feature: false }
const configFile = "config.json"
const configPath = `${root}/${configFile}`

const parsers = {
  config: {
    use: (path) => path === configFile,
    parse: (content) => JSON.parse(content) as typeof configData,
    serialize: (data) => JSON.stringify(data, null, 2),
  } as Codec<typeof configData>,
}

type Config = mkConfig<typeof parsers>

const transforms: Config["transforms"] = [
  (state: Files<typeof parsers>) => ({
    ...state,
    [configFile]: { config: newConfigData },
  }),
]

const config: Config = { cwd: root, parsers, transforms }

// setup

const log = jest.spyOn(console, "log").mockImplementation(() => void 0)

const writeFile = jest.spyOn(memfs.promises, "writeFile")

jest.mock("fs/promises", () => memfs.promises)

beforeEach(() => {
  vol.fromJSON({ [configPath]: toJsonStr(configData) }, root)
})

afterEach(() => {
  jest.clearAllMocks()
})

// tests

test("dump", async () => {
  await dump(config)

  expect(log).toHaveBeenCalledWith(
    toJsonStr({
      [configFile]: {
        [onlyKeyInObject(parsers)]: configData,
      },
    }),
  )
})

test("apply", async () => {
  await apply(config)

  expect(writeFile).toHaveBeenCalledWith(configPath, toJsonStr(newConfigData))
})
