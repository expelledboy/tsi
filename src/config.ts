import { Context } from "./design"
import { Expand, RequiredRecursively, mergeDeep, deepRemoveEqual } from "./utils"

type Features = {
  test?: {}
  lint?: {}
  format?: {}
  hooks?: {}
  tasks?: {}
}

type Feature = Expand<keyof Features>

type Meta = {
  version: "1"
  disable?: Feature[]
}

type Deps = {
  [key: string]: string
}

type Package = {
  name?: string
  deps?: {
    dist?: Deps
    dev?: Deps
  }
}

type Packages = { package: Package } | { workspace: Package; packages: Package[] }

type RequiredConfig = RequiredRecursively<Meta & Features>
type Config = Expand<Meta & Features & Packages>
type CoreConfig = RequiredConfig & Packages

export type { CoreConfig, Config }

const defaults: RequiredRecursively<Meta & Features> = {
  version: "1",
  disable: [],
  test: {},
  lint: {},
  format: {},
  hooks: {},
  tasks: {},
}

// Opportunity to add defaults, ensuring code config exists.
export const enrich = (cfg: Config, ctx: Context): CoreConfig => {
  const dirname = ctx.cwd.split("/").pop()!

  const pkg: Package = {
    name: dirname,
  }

  const packages = (): Packages =>
    "package" in cfg
      ? {
          package: mergeDeep(pkg, cfg.package),
        }
      : {
          workspace: mergeDeep(pkg, cfg.workspace),
          packages: cfg.packages || [],
        }

  return {
    ...mergeDeep(defaults, cfg),
    ...packages(),
  }
}

// Remove all props that are the same as the default.
export const compress = (cfg: CoreConfig): Config =>
  deepRemoveEqual(defaults, cfg) as Config
