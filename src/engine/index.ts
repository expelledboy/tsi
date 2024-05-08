import type { Engine } from "~/design"
import * as project from "./project"

export const engine: Engine = (feat) => (ctx) => {
  return {
    loadState: project.loadState(feat, ctx),
    reloadFile: project.reloadFile(feat, ctx),
    transform: project.transform(ctx),
    plan: project.plan(ctx),
    apply: project.apply(feat),
  }
}
