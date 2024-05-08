import { fs as memfs, vol } from "memfs"
import { dump, apply } from "./cmds"
import { Codec, Files, Context as mkConfig } from "./design"
import { onlyKeyInObject, toJsonStr } from "./utils"

// context

const root = "/project"
const configData = { feature: true }
const newConfigData = { feature: false }
const configFile = "config.json"
const configCodecKey = "CONFIG"
const configPath = `${root}/${configFile}`

const configCodec: Codec<typeof configData> = {
  decode: (content) => JSON.parse(content) as typeof configData,
  encode: (data) => JSON.stringify(data, null, 2),
  take: (files) => files.some((path) => path.endsWith(configFile)),
  is: (data) => typeof data === "object",
}

const codecs = {
  [configCodecKey]: configCodec,
}

type Config = mkConfig<typeof codecs>

const plugins: Config["extensions"] = [
  {
    parse: (path: string) => (path.endsWith(configFile) ? [configCodecKey] : []),
    capture: (files: Files<typeof codecs>) => ({}),
    transform: (files, config, ctx) => ({
      [configFile]: { [configCodecKey]: newConfigData },
    }),
  },
]

const config: Config = {
  cwd: root,
  codecs: codecs,
  extensions: plugins,
}

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
        [onlyKeyInObject(codecs)]: configData,
      },
    }),
  )
})

test("apply", async () => {
  await apply(config)

  expect(writeFile).toHaveBeenCalledWith(configPath, toJsonStr(newConfigData))
})
