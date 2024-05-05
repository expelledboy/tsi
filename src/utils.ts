export const toJsonStr = (data: any) => JSON.stringify(data, null, 2)

type HashMap = Record<string, any>

export const onlyKeyInObject = <T extends HashMap>(obj: T) =>
  Object.keys(obj)[0] as keyof T

export const cleanObject = (obj: HashMap) => {
  for (const key in obj) {
    if (obj[key] === undefined) {
      delete obj[key]
    }
  }
}
