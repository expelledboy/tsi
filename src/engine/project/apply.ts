import type { Environment, Project } from "~/design"

export const apply =
  (env: Environment): Project["apply"] =>
  async (ops) => {
    ops.forEach(async (op) => {
      switch (op.type) {
        case "write":
          return env.file.write(op.path, op.content)
        case "remove":
          return await env.file.delete(op.path)
        case "ignore":
          return await env.git.ignore(op.path)
        case "gitInit":
          return await env.git.init()
      }
    })
  }
