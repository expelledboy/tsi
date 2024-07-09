import { fs as memfs, vol } from "memfs"
import { Codec, Files, Context as makeContext } from "./design"
import { onlyKeyInObject, toJsonStr } from "./utils"
import { main } from "./index"

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

type Context = makeContext<typeof codecs>

const plugins: Context["extensions"] = [
  {
    parse: (path: string) => (path.endsWith(configFile) ? [configCodecKey] : []),
    capture: (files: Files<typeof codecs>) => ({}),
    transform: (files, config, ctx) => ({
      [configFile]: { [configCodecKey]: newConfigData },
    }),
  },
]

const context: Context = {
  cwd: root,
  codecs: codecs,
  extensions: plugins,
  command: "help",
  options: { git: true, install: true },
}

// setup

const log = jest.spyOn(console, "log").mockImplementation(() => void 0)
const cwd = jest.spyOn(process, "cwd").mockReturnValue(root)
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
  const cxt = { ...context, command: "dump" }

  await main(cxt as any)

  expect(log).toHaveBeenNthCalledWith(
    1,
    toJsonStr({
      context: cxt,
      files: {
        [configFile]: {
          [onlyKeyInObject(codecs)]: configData,
        },
      },
    }),
  )
})
