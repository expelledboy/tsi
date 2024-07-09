import { parseEnv } from "./env"

describe("parseEnv", () => {
  it("obtain env variables", () => {
    const env = parseEnv({
      TSI_NO_GIT: "true",
      TSI_NO_INSTALL: "false",
      NODE_ENV: "production",
      CI: "1",
    })
    expect(env).toEqual({
      TSI_NO_GIT: true,
      TSI_NO_INSTALL: false,
      NODE_ENV: "production",
      CI: true,
    })
  })

  it("don't assume defaults if env variables are missing", () => {
    const env = parseEnv({})
    expect(env).toEqual({})
  })
})
