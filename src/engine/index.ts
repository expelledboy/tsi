import { Engine } from "~/design"
import * as project from "./project"

export const engine: Engine = (features) => (config) => {
  return {
    loadState: project.loadState(features)(config),
    reloadFile: project.reloadFile(features)(config),
    transform: project.transform(config),
    plan: project.plan(config),
    apply: project.apply(features),
  }
}
