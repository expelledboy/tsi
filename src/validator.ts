const optional = <T>(v: unknown): v is T => v === undefined

const constrain = (fn: (v: unknown) => boolean) => (v: any) => fn(v)

const type =
  (t: string) =>
  <T>(v: unknown): v is T =>
    typeof v === t

const string = type("string")
const number = type("number")
const boolean = type("boolean")
const object = type("object")

const or =
  (...fns: ((v: unknown) => boolean)[]) =>
  <T>(v: unknown): v is T =>
    fns.some((fn) => fn(v))

const and =
  (...fns: ((v: unknown) => boolean)[]) =>
  <T>(v: unknown): v is T =>
    fns.every((fn) => fn(v))

const obj =
  (schema: Record<string, (v: unknown) => boolean>) =>
  <T>(v: unknown): v is T =>
    typeof v === "object" &&
    v !== null &&
    Object.entries(schema).every(([key, fn]) => fn((v as Record<string, any>)[key]))

const regex = (re: RegExp) =>
  and(
    type("string"),
    constrain((v) => re.test(v as string)),
  )

export const spec = <T>(
  fn: (deps: {
    optional: typeof optional
    constrain: typeof constrain
    type: typeof type
    string: typeof string
    number: typeof number
    boolean: typeof boolean
    object: typeof object
    or: typeof or
    and: typeof and
    obj: typeof obj
    regex: typeof regex
  }) => (v: unknown) => v is T,
) =>
  fn({
    optional,
    constrain,
    type,
    string,
    number,
    boolean,
    object,
    or,
    and,
    obj,
    regex,
  })
