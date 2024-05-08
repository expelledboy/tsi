import type { Codec } from "~/design"
import { spec } from "~/validator"

export type NodePackage = {
  name?: string
  private?: string
  version?: string
  main?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

const is = spec<NodePackage>(({ or, obj, object, string, optional, regex }) =>
  obj({
    name: or(optional, string),
    version: or(optional, regex(/\d+\.\d+\.\d+/)),
    main: or(optional, string),
    dependencies: or(optional, object),
    devDependencies: or(optional, object),
  }),
)

const decode = (content: string): NodePackage => {
  try {
    return JSON.parse(content)
  } catch {
    return {}
  }
}

const encode = (data: NodePackage): string => JSON.stringify(data, null, 2) + "\n"

const take = (files: string[]): boolean =>
  files.some((path) => path.endsWith("package.json"))

export const nodePackage: Codec<NodePackage> = {
  decode,
  encode,
  take,
  is,
}
