import type { Context, Project } from "~/design"
import type { Config } from "~/config"
import { enrich } from "~/config"

export const transform =
  (ctx: Context): Project["transform"] =>
  (state) => {
    const derivedConfig = ctx.extensions
      .filter((ext) => !!ext.capture)
      .map((ext) => ext.capture!(state, ctx))
      .reduce((acc, cfg) => ({ ...acc, ...cfg }), {})

    const tsiConfig = enrich(derivedConfig as Config, ctx)

    // TODO: validate tsiConfig

    const desiredState = ctx.extensions
      .filter((ext) => !!ext.transform)
      .reduce((acc, ext) => ext.transform!(acc, tsiConfig, ctx), state)

    return desiredState
  }
