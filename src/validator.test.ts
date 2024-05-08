import { spec } from "./validator"

test("validator", () => {
  const isString = spec(({ type }) => type("string"))
  expect(isString("")).toBe(true)
  expect(isString(0)).toBe(false)

  const isOptionalNumber = spec(({ or, optional, type }) => or(optional, type("number")))
  expect(isOptionalNumber(undefined)).toBe(true)
  expect(isOptionalNumber(0)).toBe(true)

  const isPackage = spec(({ obj, type, optional, constrain: limit }) =>
    obj({
      name: type("string"),
      deps: obj({
        dist: optional,
        dev: optional,
      }),
    }),
  )
  expect(isPackage({ name: "project", deps: {} })).toBe(true)
  expect(isPackage({ name: 0 })).toBe(false)
})
