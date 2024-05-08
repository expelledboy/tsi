import type { Extension } from "~/design"
import { codecs } from "~/codecs"

export const packagesExtension: Extension<typeof codecs> = {
  parse: (path) => (path.match(/package.json$/) ? ["nodePackage"] : []),

  capture: (files, cxt) => {
    const filenames = Object.keys(files)

    if (!filenames.some((path) => path.endsWith("package.json"))) {
      return {}
    }

    const rootConfig = files["package.json"]?.nodePackage

    // default name to the directory name
    const name = rootConfig?.name || cxt.cwd.split("/").pop()!

    // single package
    if (filenames.filter((path) => path.endsWith("package.json")).length === 1) {
      return {
        package: { name },
      }
    }

    // has multiple packages, making this a monorepo

    const packages = filenames
      .filter((path) => path.match(/\/package.json$/)) // not root package
      .map((path) => {
        return {
          name: files[path].nodePackage?.name,
        }
      })

    return {
      workspace: { name },
      packages,
    }
  },

  transform: (files, config) => {
    const filenames = Object.keys(files)

    if ("package" in config) {
      const diff = { ...files }

      for (const path of filenames.filter((path) => path.endsWith("package.json"))) {
        delete diff[path]
      }

      diff["package.json"] = {
        nodePackage: {
          name: config.package.name,
        },
      }

      return diff
    }

    return {
      ...files,
    }
  },
}
