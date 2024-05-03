import { Codec, Config } from "./design"

const json: Codec<Object> = {
  use: (path) => path.endsWith(".json"),
  parse: (content) => JSON.parse(content),
  serialize: (data) => JSON.stringify(data, null, 2),
}

export const parsers = { json }

export const config: Config<typeof parsers> = {
  cwd: process.cwd(),
  parsers,
  transforms: [],
}
