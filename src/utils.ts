export const toJsonStr = (data: any) => JSON.stringify(data, null, 2)

type HashMap = Record<string, any>

export const onlyKeyInObject = <T extends HashMap>(obj: T) => {
  const keys = Object.keys(obj)

  if (keys.length !== 1) {
    throw new Error(keys.length === 0 ? "no keys in object" : "multiple keys in object")
  }

  return keys[0] as keyof T
}

export const cleanObject = <T extends HashMap>(o: T) => {
  const obj = { ...o }

  for (const key in obj) {
    if (obj[key] === undefined) {
      delete obj[key]
    }
  }

  return Object.keys(obj).length === 0 ? undefined : obj
}

export const isEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b)

// https://stackoverflow.com/a/69288824/644945
export type Expand<T> = T extends (...args: infer A) => infer R
  ? (...args: Expand<A>) => Expand<R>
  : T extends infer O
    ? { [K in keyof O]: O[K] }
    : never

export type ExpandRecursively<T> = T extends (...args: infer A) => infer R
  ? (...args: ExpandRecursively<A>) => ExpandRecursively<R>
  : T extends object
    ? T extends infer O
      ? { [K in keyof O]: ExpandRecursively<O[K]> }
      : never
    : T

export type RequiredRecursively<T> = T extends (...args: infer A) => infer R
  ? (...args: RequiredRecursively<A>) => RequiredRecursively<R>
  : T extends object
    ? T extends infer O
      ? { [K in keyof O]-?: RequiredRecursively<O[K]> }
      : never
    : T

// https://stackoverflow.com/a/48218209
export const mergeDeep = (...objects: any[]) => {
  const isObject = (obj: any) => obj && typeof obj === "object" && !Array.isArray(obj)

  return objects.reduce((prev, obj) => {
    if (obj === undefined) return prev

    Object.keys(obj).forEach((key) => {
      const pVal = prev[key]
      const oVal = obj[key]

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal)
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal)
      } else {
        prev[key] = oVal
      }
    })

    return prev
  }, {})
}

export const deepRemoveEqual = <T extends HashMap>(
  target: T,
  reference: T,
): Partial<T> => {
  const obj = { ...target } as Partial<T>

  for (const key in reference) {
    if (typeof target[key] === "object") {
      if (key in reference) {
        const result = deepRemoveEqual(target[key], reference[key]!)

        if (Object.keys(result).length === 0) {
          delete obj[key]
        }
      }
    } else if (target[key] === reference[key]) {
      delete obj[key]
    }
  }

  return obj
}
