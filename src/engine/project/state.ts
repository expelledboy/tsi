import { Config, Features, Parser, Project, Schema } from "~/design"

export const loadState =
  ({ file }: Features) =>
  ({ cwd, parsers }: Config): Project["loadState"] =>
  async () => {
    const files = await file.listAll(cwd)

    return Promise.all(
      files.map(async (path) => ({
        [path]: await parse(file, parsers, path, cwd),
      })),
    ).then((states) => Object.assign({}, ...states))
  }

export const reloadFile =
  ({ file }: Features) =>
  ({ cwd, parsers }: Config): Project["reloadFile"] =>
  async (path, state) => {
    const parsed = await parse(file, parsers, path, cwd)

    return {
      ...state,
      [path]: parsed,
    }
  }

const parse = async (
  file: Features["file"],
  parsers: Parser,
  path: string,
  cwd: string,
) => {
  const codecs = useParser(parsers)(path)

  if (Object.keys(codecs).length === 0) {
    return {} as Schema
  }

  const content = await file.read(`${cwd}/${path}`)

  return Object.entries(codecs).reduce(
    async (acc, [name, codec]) => ({
      ...acc,
      [name]: codec.parse(content),
    }),
    {},
  ) as Schema
}

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
