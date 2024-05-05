import { Config } from "./design"
import { features } from "./ioc"
import { engine } from "./engine"
import { parsers } from "./parsers"
import { transforms } from "./transforms"

export const defaultConfig: Config<typeof parsers> = {
  cwd: process.cwd(),
  parsers,
  transforms,
}

export const dump = async (config: Config<any> = defaultConfig) => {
  const project = engine(features)(config)
  const state = await project.loadState()
  console.log(JSON.stringify(state, null, 2))
}

export const apply = async (config: Config<any> = defaultConfig) => {
  const project = engine(features)(config)
  const state = Object.freeze(await project.loadState())
  const transformed = project.transform(state)
  const ops = await project.plan(state, transformed)
  await project.apply(ops)
}
