import type { Effects, Project } from "~/design"

export const apply =
  (exec: Effects): Project["apply"] =>
  async (ops) => {
    ops.forEach(async (op) => {
      switch (op.type) {
        case "write":
          return exec.file.write(op.path, op.content)
        case "remove":
          return await exec.file.delete(op.path)
        case "ignore":
          return await exec.git.ignore(op.path)
        case "gitInit":
          return await exec.git.init()
      }
    })
  }
