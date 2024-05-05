import { Transform } from "~/design"
import { parsers } from "~/parsers"
import { upgradeVersion } from "./upgradeVersion"

export const transforms: Transform<typeof parsers>[] = [upgradeVersion]
