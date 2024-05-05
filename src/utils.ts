export const toJsonStr = (data: any) => JSON.stringify(data, null, 2)

export const onlyKeyInObject = <T extends Record<string, any>>(obj: T) =>
  Object.keys(obj)[0] as keyof T
