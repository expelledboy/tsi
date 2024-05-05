import { Codec } from "../design"

type NodePackage = {
  name?: string
  version?: string
  main?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export const nodePackage: Codec<NodePackage> = {
  use: (path) => path.endsWith("package.json"),
  parse: (content) => JSON.parse(content),
  serialize: (data) => JSON.stringify(data, null, 2) + "\n",
}
