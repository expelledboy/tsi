import { features } from "./ioc"
import { tsi } from "./tsi"

import type { config as Config } from "./config"

export const dump = async (config: typeof Config) => {
  const project = tsi(features)(config)
  const state = await project.loadState()
  console.log(JSON.stringify(state, null, 2))
}
