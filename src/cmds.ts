import { Context } from "./design"
import { features } from "./ioc"
import { engine } from "./engine"
import { codecs } from "./codecs"
import { extensions } from "./extensions"

export const defaultConfig: Context<typeof codecs> = {
  cwd: process.cwd(),
  codecs,
  extensions,
}

export const dump = async (config: Context<any> = defaultConfig) => {
  const project = engine(features)(config)
  const state = await project.loadState()
  console.log(JSON.stringify(state, null, 2))
}

export const dryRun = async (config: Context<any> = defaultConfig) => {
  const project = engine(features)(config)
  const state = Object.freeze(await project.loadState())
  const transformed = project.transform(state)
  const ops = await project.plan(state, transformed)
  ops.forEach((op) => console.log(op))
}

export const apply = async (config: Context<any> = defaultConfig) => {
  const project = engine(features)(config)
  const state = Object.freeze(await project.loadState())
  const transformed = project.transform(state)
  const ops = await project.plan(state, transformed)
  await project.apply(ops)
}
