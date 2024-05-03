import fs from "fs/promises"
import { Features } from "./design"

// TODO: implement gitignore
const gitignore = (path: string) =>
  [".git/", "node_modules/", "dist/", ".direnv/"].some((name) => path.includes(name))

const listAllFiles = async (path: string) =>
  fs.readdir
    .bind(fs)(path, { recursive: true })
    .then((files) => files.map((file) => `${path}/${file}`))
    .then((files) => files.filter((file) => !gitignore(file)))
    .then((files) =>
      Promise.all(
        files.map(async (file) => ({
          path: file,
          stat: await fs.stat(file),
        })),
      ),
    )
    .then((files) => files.filter((file) => file.stat.isFile()).map((file) => file.path))

const readFile = async (path: string) => fs.readFile(path, "utf-8")
const createFile = async (path: string, content: string) => fs.writeFile(path, content)
const deleteFile = async (path: string) => fs.unlink(path)
const ignoreFile = async (path: string) => console.log(`Ignoring file: ${path}`)

export const features: Features = {
  file: {
    listAll: listAllFiles,
    read: readFile,
    write: createFile,
    delete: deleteFile,
  },
  repo: {
    ignoreFile: ignoreFile,
  },
}
