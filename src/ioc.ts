// const util = require('node:util');
import fs from "fs/promises"
import { Features } from "./design"
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

const listAllFiles = async (path: string) =>
  fs.readdir
    .bind(fs)(path, {
      recursive: true,
      withFileTypes: true,
    })
    .then((stats) =>
      stats
        .filter((dirent) => dirent.isFile())
        .map(({ path, name }) => `${path}/${name}`)
        .filter((file) => !gitignore(file))
        .map((file) => file.replace(path + "/", "")),
    )

const dirExists = async (path: string) =>
  fs
    .stat(path)
    .then(() => true)
    .catch(() => false)

export const features: Features = {
  file: {
    listAll: listAllFiles,
    read: async (path: string) => fs.readFile(path, "utf-8"),
    write: (path: string, content: string) => fs.writeFile(path, content),
    delete: async (path: string) => fs.unlink(path),
  },
  dir: {
    exists: dirExists,
  },
  git: {
    init: async () => {
      await sh("git init")
    },
    ignore: async (path: string) => console.log(`Ignoring file: ${path}`),
  },
}
