export type Loader<T extends object> = {
  isInterested: (path: string) => boolean
  parse: (content: string) => T
}

export type Loaders = {
  [name: string]: Loader<any>
}

export type State<L extends Loaders> = {
  [filename: string]: {
    [K in keyof L]: ReturnType<L[K]["parse"]>
  }
}

export type StateLoader = (
  deps: {
    listAllFiles: (path: string) => Promise<string[]>
    readFile: (path: string) => Promise<string>
  },
  loaders: Loaders,
) => {
  loadState: (files: string[]) => Promise<State<Loaders>>
  reloadFile: (path: string, state: State<Loaders>) => Promise<State<Loaders>>
}

export type Op = (
  | { type: "add"; content: string }
  | { type: "update"; content: string }
  | { type: "remove" }
  | { type: "ignore" }
) & { path: string }

export type plan = <L extends Loaders>(state: State<L>) => Promise<Op[]>

export type apply = (deps: {
  createFile: (path: string, content: string) => Promise<void>
  updateFile: (path: string, content: string) => Promise<void>
  deleteFile: (path: string) => Promise<void>
  ignoreFile: (path: string) => Promise<void>
}) => <L extends Loaders>(ops: Op[], state: State<L>) => Promise<void>

export type Deps = Parameters<StateLoader>[0] & Parameters<apply>[0]

export type System = {
  loadConfig: () => Promise<{ loaders: Loaders }>
  stateLoader: StateLoader
  plan: plan
  apply: apply
}

export const run =
  (deps: Deps, system: System) =>
  async (dir: string): Promise<void> => {
    const config = await system.loadConfig()
    const stateLoader = system.stateLoader(deps, config.loaders)
    const allFiles = await deps.listAllFiles(dir)
    const state = await stateLoader.loadState(allFiles)
    const ops = await system.plan(state)
    const apply = system.apply(deps)
    await apply(ops, state)
  }
