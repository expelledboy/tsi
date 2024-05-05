import { Codec } from "../design"

type TSIConfig = {
  version: "1"
}

export const tsiConfig: Codec<TSIConfig> = {
  use: (path) => path.endsWith("tsi.json"),
  parse: (content) => JSON.parse(content),
  serialize: (data) => JSON.stringify(data, null, 2) + "\n",
}
