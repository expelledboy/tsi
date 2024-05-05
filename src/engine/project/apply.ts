import { Features, Project } from "~/design"

export const apply =
  ({ file, git }: Features): Project["apply"] =>
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
          await git.ignore(op.path)
          break
        case "gitInit":
          await git.init()
          break
      }
    })
  }
