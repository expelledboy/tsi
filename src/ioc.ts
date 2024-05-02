import fs from "fs/promises"
import { Deps } from "./design"

const listAllFiles = async (path: string) =>
  fs.readdir
    .bind(fs)(path, { recursive: true })
    .then((files) => files.map((file) => `${path}/${file}`))

export const deps: Deps = {
  listAllFiles,
  readFile: async (path: string) => fs.readFile(path, "utf-8"),
  createFile: async (path: string, content: string) => fs.writeFile(path, content),
  updateFile: async (path: string, content: string) => fs.writeFile(path, content),
  deleteFile: async (path: string) => fs.unlink(path),
  ignoreFile: async (path: string) => console.log(`Ignoring file: ${path}`),
}
