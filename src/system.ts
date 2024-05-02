import { Loaders, Op, State, System } from "./design"

const packageLoader = {
  isInterested: (path: string) => path.endsWith("package.json"),
  parse: (content: string) => JSON.parse(content),
}

const loadConfig: System["loadConfig"] = async () => {
  // TODO: Check config file for loader configurations

  const loaders: Loaders = {
    package: packageLoader,
  }

  return { loaders }
}

const interestedLoaders = (loaders: Loaders, filename: string): Loaders =>
  Object.entries(loaders).reduce(
    (acc, [name, loader]) =>
      loader.isInterested(filename) ? { ...acc, [name]: loader } : acc,
    {},
  )

const parse =
  (readFile: (path: string) => Promise<string>) =>
  async (loaders: Loaders, filename: string) => {
    const interested = interestedLoaders(loaders, filename)

    if (Object.keys(interested).length === 0) {
      return {}
    }

    const content = await readFile(filename)

    return Object.entries(interested).reduce(
      (acc, [name, loader]) => ({ ...acc, [name]: loader.parse(content) }),
      {},
    )
  }

const stateLoader: System["stateLoader"] = (deps, loaders) => {
  const loadState = async (files: string[]): Promise<State<Loaders>> =>
    Promise.all(
      files.map(async (filename) => ({
        [filename]: await parse(deps.readFile)(loaders, filename),
      })),
    ).then((states) => Object.assign({}, ...states))

  const reloadFile = async (
    filename: string,
    state: State<Loaders>,
  ): Promise<State<Loaders>> =>
    parse(deps.readFile)(loaders, filename).then((parsed) => ({
      ...state,
      [filename]: parsed,
    }))

  return { loadState, reloadFile }
}

const plan: System["plan"] = async (state) => {
  // Implement your planning logic here
  const ops: Op[] = []

  return ops
}

const apply: System["apply"] = (deps) => async (ops, state) => {
  for (const op of ops) {
    switch (op.type) {
      case "add":
        await deps.createFile(op.path, op.content)
        break
      case "update":
        await deps.updateFile(op.path, op.content)
        break
      case "remove":
        await deps.deleteFile(op.path)
        break
      case "ignore":
        await deps.ignoreFile(op.path)
        break
    }
  }
}

export const system: System = {
  loadConfig,
  stateLoader,
  plan,
  apply,
}
