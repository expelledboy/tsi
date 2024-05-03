import type { TSI } from "./design"
import { apply, loadState, plan, reloadFile, transform } from "./project"

export const tsi: TSI<typeof import("./config").config> = (features) => (config) => {
  return {
    loadState: loadState(features)(config),
    reloadFile: reloadFile(features)(config),
    transform: transform(config),
    plan: plan(config),
    apply: apply(features),
  }
}
