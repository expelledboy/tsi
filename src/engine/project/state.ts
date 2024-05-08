import type { Context, Environment, Project, Meta } from "~/design"

// Parses all files using the available parsers.
// Perf: Extensions must explicitly request parser.
export const loadState =
  (env: Environment, ctx: Context): Project["loadState"] =>
  async () => {
    const files = await env.file.listAll(ctx.cwd)

    const fileParts = Promise.all(
      files.map(async (path) => ({
        [path]: await parse(env, ctx, path),
      })),
    )

    return fileParts.then((part) => Object.assign({}, ...part))
  }

// Reloads a single file into the state.
export const reloadFile =
  (env: Environment, ctx: Context): Project["reloadFile"] =>
  async (path, state) => ({
    ...state,
    [path]: await parse(env, ctx, path),
  })

const parse = async (env: Environment, ctx: Context, path: string) => {
  const fileSchema = {} as Meta

  const codecs = ctx.extensions
    .filter((ext) => !!ext.parse) // has parse method
    .map((ext) => ext.parse!(path)) // get parsers
    .flat()
    .filter((v, i, a) => a.indexOf(v) === i) // unique

  // Don't read file if not needed
  if (codecs.length === 0) return fileSchema

  codecs.forEach((name) => {
    if (!ctx.codecs[name]) {
      throw new Error(`Codec "${name}" not found`)
    }
  })

  const content = await env.file.read(`${ctx.cwd}/${path}`)

  return codecs.reduce(
    (acc, c) => ({
      ...acc,
      [c]: ctx.codecs[c].decode(content),
    }),
    fileSchema,
  )
}
