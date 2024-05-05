import { Config, Project } from "~/design"

export const transform =
  ({ transforms }: Config): Project["transform"] =>
  (state) =>
    transforms.reduce((acc, transform) => transform(acc), state)
