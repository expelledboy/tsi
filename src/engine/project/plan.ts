import type { Context, Files, Operation, Codecs, Project, Meta } from "~/design"
import { onlyKeyInObject, isEqual } from "~/utils"

// Generates list of operations to effect the desired state.
export const plan =
  (ctx: Context): Project["plan"] =>
  async (state, desiredState) => {
    const ops: Operation[] = []

    const fileExists = (path: string, files: Files<Codecs> = state) =>
      files[path] !== undefined

    // Initialize git repository if it doesn't exist.
    if (!fileExists(".git/HEAD")) {
      ops.push({
        type: "gitInit" as const,
      })
    }

    const fullPath = (path: string) => `${ctx.cwd}/${path}`

    const create = Object.entries(desiredState)
      .filter(([path]) => !fileExists(path))
      .map(([path, meta]) => ({
        type: "write" as const,
        path: fullPath(path),
        content: serialize(meta, ctx),
      }))

    const remove = Object.entries(state)
      .filter(([path]) => !fileExists(path, desiredState))
      .map(([path]) => ({
        type: "remove" as const,
        path: fullPath(path),
      }))

    const update = Object.entries(desiredState)
      .filter(([path, meta]) => {
        if (Object.keys(meta).length === 0) return false
        const codec = onlyKeyInObject(meta)
        return fileExists(path) && !isEqual(state[path][codec], meta[codec])
      })
      .map(([path, meta]) => ({
        type: "write" as const,
        path: fullPath(path),
        content: serialize(meta, ctx),
      }))

    // Ignore any files that are created or updated.
    const ignore = [...create, ...update].map(({ path }) => ({
      type: "ignore" as const,
      path,
    }))

    ops.push(...create, ...remove, ...update, ...ignore)

    return ops
  }

// Serializes the metadata object for a file.
const serialize = (meta: Meta<Codecs>, ctx: Context) => {
  try {
    const codec = onlyKeyInObject(meta)
    return ctx.codecs[codec].encode(meta[codec])
  } catch (e) {
    throw new Error("multiple codecs specified in file meta")
  }
}
