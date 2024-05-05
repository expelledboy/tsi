import { Config } from "./design"
import { engine } from "./engine"
import { features } from "./ioc"
import { parsers } from "./parsers"

export const defaultConfig: Config<typeof parsers> = {
  cwd: process.cwd(),
  parsers,
  transforms: [],
}

export const dump = async (config: Config<any> = defaultConfig) => {
  const project = engine(features)(config)
  const state = await project.loadState()
  console.log(JSON.stringify(state, null, 2))
}

export const apply = async (config: Config<any> = defaultConfig) => {
  const project = engine(features)(config)
  const state = await project.loadState()
  const transformed = project.transform(state)
  const ops = await project.plan(state, transformed)
  await project.apply(ops)
}
