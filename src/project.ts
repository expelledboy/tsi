import { Features, Project, Schema } from "./design"

type Config = typeof import("./config").config
type Parser = Config["parsers"]

type API = Project<Parser>

const useParser = (parser: Parser) => (path: string) =>
  Object.entries(parser).reduce(
    (acc, [name, codec]) => {
      if (codec.use(path)) {
        return { ...acc, [name]: codec }
      }
      return acc
    },
    {} as typeof parser,
  )

const parse = async <T extends Parser>(
  file: Features["file"],
  parsers: T,
  path: string,
) => {
  const codecs = useParser(parsers)(path)

  if (Object.keys(codecs).length === 0) {
    return {} as Schema<T>
  }

  const content = await file.read(path)

  return Object.entries(codecs).reduce(
    async (acc, [name, codec]) => ({
      ...acc,
      [name]: codec.parse(content),
    }),
    {},
  ) as Schema<T>
}

const serialize: (schema: Schema<Parser>, parsers: Parser) => string = (
  schema,
  parsers,
) => {
  const codecs = Object.keys(schema).length
  if (codecs !== 1) throw new Error("Invalid schema")
  const [name, data] = Object.entries(schema)[0]
  const codec = parsers[name as keyof Parser]
  return codec.serialize(data)
}

export const loadState =
  ({ file }: Features) =>
  ({ cwd, parsers }: Config): API["loadState"] =>
  async () => {
    const files = await file.listAll(cwd)

    return Promise.all(
      files.map(async (path) => ({
        [path]: await parse(file, parsers, path),
      })),
    ).then((states) => Object.assign({}, ...states))
  }

export const reloadFile =
  ({ file }: Features) =>
  ({ parsers }: Config): API["reloadFile"] =>
  async (path, state) => {
    const parsed = await parse(file, parsers, path)

    return {
      ...state,
      [path]: parsed,
    }
  }

export const transform =
  ({ transforms }: Config): API["transform"] =>
  (state) =>
    transforms.reduce((acc, transform) => transform(acc), state)

export const plan =
  ({ parsers }: Config): API["plan"] =>
  async (state, desiredState) => {
    const create = Object.entries(desiredState)
      .filter(([path]) => state[path] === undefined)
      .map(([path, schema]) => ({
        type: "write" as const,
        path,
        content: serialize(schema, parsers),
      }))

    const remove = Object.entries(state)
      .filter(([path]) => desiredState[path] === undefined)
      .map(([path]) => ({ type: "remove" as const, path }))

    const update = Object.entries(desiredState)
      .filter(([path, content]) => state[path] !== undefined && state[path] !== content)
      .map(([path, schema]) => ({
        type: "write" as const,
        path,
        content: serialize(schema, parsers),
      }))

    const ignore = [...create, ...update].map(({ path }) => ({
      type: "ignore" as const,
      path,
    }))

    return [...create, ...remove, ...update, ...ignore]
  }

export const apply =
  ({ file, repo }: Features): API["apply"] =>
  async (ops) => {
    ops.forEach(async (op) => {
      switch (op.type) {
        case "write":
          await file.write(op.path, op.content)
          break
        case "remove":
          await file.delete(op.path)
          break
        case "ignore":
          await repo.ignoreFile(op.path)
          break
      }
    })
  }
