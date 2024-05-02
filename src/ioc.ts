import fs from "fs/promises"
import { Deps } from "./design"

export const deps: Deps = {
  listAllFiles: async (path: string) => fs.readdir(path, { recursive: true }),
  readFile: async (path: string) => fs.readFile(path, "utf-8"),
  createFile: async (path: string, content: string) => fs.writeFile(path, content),
  updateFile: async (path: string, content: string) => fs.writeFile(path, content),
  deleteFile: async (path: string) => fs.unlink(path),
  ignoreFile: async (path: string) => console.log(`Ignoring file: ${path}`),
}
