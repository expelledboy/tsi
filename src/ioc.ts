import fs from "fs/promises"
import { resolve } from "path"
import { Effects } from "./design"
import { promisify } from "node:util"
import { exec } from "child_process"

const sh = promisify(exec)

const requireBin = async (name: string) => {
  try {
    await sh(`which ${name}`)
  } catch {
    console.error(`Please install ${name} to use tsi`)
    process.exit(1)
  }
}

const bins = ["git", "node", "pnpm"]

export const requireBins = async () => {
  await Promise.all(bins.map(requireBin))
}

// TODO: implement gitignore
const gitignore = (path: string) =>
  [".git/objects", "node_modules/"].some((name) => path.includes(name))

async function getFiles(dir: string): Promise<string[]> {
  const stats = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    stats.map((stat) => {
      const res = resolve(dir, stat.name)
      return stat.isDirectory() ? getFiles(res) : res
    }),
  )
  return Array.prototype.concat(...files)
}

const listAllFiles = async (path: string) =>
  getFiles(path).then((files) =>
    files.filter((file) => !gitignore(file)).map((file) => file.replace(path + "/", "")),
  )

const exists = async (path: string) =>
  fs
    .stat(path)
    .then(() => true)
    .catch(() => false)

export const environment: Effects = {
  file: {
    listAll: listAllFiles,
    read: async (path: string) => fs.readFile(path, "utf-8"),
    write: (path: string, content: string) => fs.writeFile(path, content),
    delete: async (path: string) => fs.unlink(path),
    exists,
  },
  dir: {
    exists,
  },
  git: {
    init: async () => {
      await sh("git init")
    },
    ignore: async (path: string) => console.log(`Ignoring file: ${path}`),
  },
}
