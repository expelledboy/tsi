import { Config, Operation, Parser, Project, Schema } from "~/design"
import { onlyKeyInObject } from "~/utils"

export const plan =
  ({ cwd, parsers }: Config): Project["plan"] =>
  async (state, desiredState) => {
    const ops: Operation[] = []

    const isGitRepo = state[".git/HEAD"] !== undefined

    if (!isGitRepo) {
      ops.push({
        type: "gitInit" as const,
      })
    }

    const fullPath = (path: string) => `${cwd}/${path}`

    const create = Object.entries(desiredState)
      .filter(([path]) => state[path] === undefined)
      .map(([path, schema]) => ({
        type: "write" as const,
        path: fullPath(path),
        content: serialize(schema, parsers),
      }))

    const remove = Object.entries(state)
      .filter(([path]) => desiredState[path] === undefined)
      .map(([path]) => ({ type: "remove" as const, path: fullPath(path) }))

    const update = Object.entries(desiredState)
      .filter(([path, content]) => {
        const codec = onlyKeyInObject(content)
        return state[path] !== undefined && state[path][codec] !== content[codec]
      })
      .map(([path, schema]) => ({
        type: "write" as const,
        path: fullPath(path),
        content: serialize(schema, parsers),
      }))

    const ignore = [...create, ...update].map(({ path }) => ({
      type: "ignore" as const,
      path,
    }))

    ops.push(...create, ...remove, ...update, ...ignore)

    return ops
  }

const serialize: (schema: Schema<Parser>, parsers: Parser) => string = (
  schema,
  parsers,
) => {
  const codecs = Object.keys(schema).length
  if (codecs !== 1) throw new Error("multiple codecs specified in file schema")
  const [name, data] = Object.entries(schema)[0]
  const codec = parsers[name as keyof Parser]
  return codec.serialize(data)
}
