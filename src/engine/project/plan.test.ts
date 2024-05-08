import type { Codec, Codecs } from "~/design"
import { plan as mkPlan } from "./plan"

const jsonCodec: Codec<any> = {
  decode: (content: string) => JSON.parse(content),
  encode: (data: any) => JSON.stringify(data),
  take: (files: string[]) => files.some((path) => path.endsWith(".json")),
  is: (data: any) => typeof data === "object",
}

const context = {
  cwd: "/project",
  codecs: { json: jsonCodec },
  extensions: [],
}

const plan = mkPlan(context)

describe("plan", () => {
  it("creates files when they don't exist", async () => {
    const state = {}
    const desiredState = {
      a: { json: true },
    }
    const ops = await plan(state, desiredState)
    expect(ops).toContainEqual({ type: "write", path: "/project/a", content: "true" })
  })

  it("removes files when no longer present", async () => {
    const state = {
      a: { json: true },
    }
    const desiredState = {}
    const ops = await plan(state, desiredState)
    expect(ops).toContainEqual({ type: "remove", path: "/project/a" })
  })

  it("updates files when state is different", async () => {
    const state = {
      ".git/HEAD": {},
      a: { json: true },
    }
    const desiredState = {
      ".git/HEAD": {},
      a: { json: false },
    }
    const ops = await plan(state, desiredState)
    expect(ops).toContainEqual({ type: "write", path: "/project/a", content: "false" })

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
    expect(ops).toContainEqual({ type: "ignore", path: "/project/a" })
    expect(ops).toContainEqual({ type: "ignore", path: "/project/b" })
  })

  it("errors when multiple codecs claim a file", async () => {
    const state = {
      a: { json: true, yaml: true },
    }
    await expect(plan({}, state)).rejects.toThrow(
      "multiple codecs specified in file meta",
    )
  })

  it("uses codec to serialize file content", async () => {
    const configData = {
      complex: true,
    }
    const ops = await plan(
      {
        ".git/HEAD": {},
      },
      {
        ".git/HEAD": {},
        _: { json: configData },
      },
    )
    expect(ops[0]).toMatchObject({
      content: jsonCodec.encode(configData),
    })
  })
})
