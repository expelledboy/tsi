import { enrich } from "./config"

describe("enrich", () => {
  it("default core config", () => {
    const ctx = {
      cwd: "/path/to/project",
      codecs: {},
      extensions: [],
    }
    expect(
      enrich(
        {
          version: "1",
          package: {
            name: "project",
            deps: {},
          },
        },
        ctx,
      ),
    ).toMatchObject({
      version: "1",
      disable: [],
      test: {},
      lint: {},
      format: {},
      hooks: {},
      tasks: {},
      package: {
        name: "project",
        deps: {},
      },
    })
  })
})
