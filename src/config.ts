import { Config } from "./design"
import { parsers } from "./parsers"

export const config: Config<typeof parsers> = {
  cwd: process.cwd(),
  parsers,
  transforms: [],
}
