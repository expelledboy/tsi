import type { Extension } from "~/design"
import { codecs } from "~/codecs"
import { cleanObject } from "~/utils"

export const packagesExtension: Extension<typeof codecs> = {
  parse: (path) => (path.match(/package.json$/) ? ["nodePackage"] : []),

  capture: (files, cxt) => {
    const filenames = Object.keys(files)
    const pkgFiles = filenames.filter((path) => path.endsWith("package.json"))

    if (pkgFiles.length === 0) {
      return {}
    }

    const rootConfig = files["package.json"]?.nodePackage

    const pkg = cleanObject({
      name: rootConfig?.name,
      deps: cleanObject({
        dist: rootConfig!.dependencies,
        dev: rootConfig!.devDependencies,
      }),
    })

    if (pkgFiles.length === 1) {
      return pkg === undefined ? {} : { package: pkg }
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
      workspace: pkg,
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
        nodePackage: cleanObject({
          name: config.package.name,
          dependencies: config.package.deps?.dist,
          devDependencies: config.package.deps?.dev,
        }),
      }

      return diff
    }

    return {
      ...files,
    }
  },
}
