import { spec } from "~/validator"

export type ENV = {
  TSI_NO_GIT: boolean
  TSI_NO_INSTALL: boolean
  NODE_ENV: "development" | "production" | "test"
  CI: boolean
}

const is = spec<ENV>(({ or, obj, boolean, string, optional }) =>
  obj({
    TSI_NO_GIT: or(boolean, optional),
    TSI_NO_INSTALL: or(boolean, optional),
    NODE_ENV: or(string, optional),
    CI: or(boolean, optional),
  }),
)

export const parseEnv = (ENV: NodeJS.ProcessEnv = process.env): ENV => {
  const flag = (v: unknown) => (v === undefined ? undefined : v !== "false")

  const env = {
    TSI_NO_GIT: flag(ENV.TSI_NO_GIT),
    TSI_NO_INSTALL: flag(ENV.TSI_NO_INSTALL),
    NODE_ENV: ENV.NODE_ENV,
    CI: flag(ENV.CI),
  }

  if (!is(env)) {
    throw new Error("Invalid environment variables")
  }

  return env
}
