import { Parser } from "~/design"
import { plan as mkPlan } from "./plan"

const configuredParsers: Parser = {
  json: {
    use: (path: string) => path.endsWith(".json"),
    parse: (content: string) => JSON.parse(content),
    serialize: (data: any) => JSON.stringify(data),
  },
}

const config = {
  cwd: "/project",
  parsers: configuredParsers,
  transforms: [],
}

const plan = mkPlan(config)

describe("plan", () => {
  it("creates files when they don't exist", async () => {
    const state = {}
    const desiredState = {
      a: { json: true },
    }
    const ops = await plan(state, desiredState)
    expect(ops).toContainEqual({ type: "write", path: "a", content: "true" })
  })

  it("removes files when no longer present", async () => {
    const state = {
      a: { json: true },
    }
    const desiredState = {}
    const ops = await plan(state, desiredState)
    expect(ops).toContainEqual({ type: "remove", path: "a" })
  })

  it("updates files when state is different", async () => {
    const state = {
      a: { json: true },
    }
    const desiredState = {
      a: { json: false },
    }
    const ops = await plan(state, desiredState)
    expect(ops).toContainEqual({ type: "write", path: "a", content: "false" })

    const nop = await plan(state, state)
    expect(nop).toEqual([])
  })

  it("ignore any files that are created or updated", async () => {
    const state = {
      a: { json: true },
    }
    const desiredState = {
      a: { json: false },
      b: { json: true },
    }
    const ops = await plan(state, desiredState)
    expect(ops).toContainEqual({ type: "ignore", path: "a" })
    expect(ops).toContainEqual({ type: "ignore", path: "b" })
  })

  it("errors when multiple codecs claim a file", async () => {
    const state = {
      a: { json: true, yaml: true },
    }
    await expect(plan({}, state)).rejects.toThrow(
      "multiple codecs specified in file schema",
    )
  })

  it("uses codec to serialize file content", async () => {
    const configData = {
      complex: true,
    }
    const ops = await plan(
      {},
      {
        _: { json: configData },
      },
    )
    expect(ops[0]).toMatchObject({
      content: configuredParsers.json.serialize(configData),
    })
  })
})
