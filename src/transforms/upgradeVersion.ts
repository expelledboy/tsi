import { Transform } from "~/design"
import { parsers } from "~/parsers"

const currentConfigVersion = "1"

const metaConfig = {
  version: currentConfigVersion,
}

export const upgradeVersion: Transform<typeof parsers> = (files) => {
  const config = !!files["tsi.json"] ? files["tsi.json"].tsiConfig! : metaConfig

  switch (config.version) {
    default:
      return Object.assign({}, files, {
        "tsi.json": {
          tsiConfig: {
            ...config,
            version: currentConfigVersion,
          },
        },
      })
  }
}
