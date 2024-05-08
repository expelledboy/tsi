import { Context } from "~/design"
import { codecs } from "~/codecs"
import { packagesExtension } from "./packages"

export const extensions: Context<typeof codecs>["extensions"] = [packagesExtension]
