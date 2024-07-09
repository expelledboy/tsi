import type { Context, Engine } from "~/design"
import * as project from "./project"
import { codecs } from "~/codecs"

export const engine: Engine<typeof codecs> = (effects) => (context) => {
  const ctx = context as unknown as Context

  return {
    context,
    loadState: project.loadState(effects, ctx),
    reloadFile: project.reloadFile(effects, ctx),
    transform: project.transform(ctx),
    plan: project.plan(ctx),
    apply: project.apply(effects),
  }
}
