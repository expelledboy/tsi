// Entry point for the project.
export type TSI<T extends Config<Parser>> = (
  provide: Features,
) => (config: T) => Project<T["parsers"]>

// Features required to effect changes.
export type Features = {
  file: {
    listAll: (path: string) => Promise<string[]>
    read: (path: string) => Promise<string>
    write: (path: string, content: string) => Promise<void>
    delete: (path: string) => Promise<void>
  }
  repo: {
    ignoreFile: (path: string) => Promise<void>
  }
}

// Runtime configuration for a project.
export type Config<T extends Parser> = {
  cwd: string
  parsers: T
  transforms: Transform<T>[]
}

// Abstracts away file encoding and decoding.
export type Codec<T extends Object> = {
  use: (path: string) => boolean
  parse: (content: string) => T
  serialize: (data: T) => string
}

// Collection of codecs for different file types.
export type Parser = {
  [name: string]: Codec<any>
}

// State of a single file translated using codecs.
export type Schema<T extends Parser> = {
  [K in keyof T]?: ReturnType<T[K]["parse"]>
}

// State of project translated using codecs.
export type Files<T extends Parser> = {
  [filename: string]: Schema<T>
}

// Transform project state using plugins.
export type Transform<T extends Parser> = (s: Files<T>) => Files<T>

// Project API
// - load current state
// - reload file, apply state changes
// - transform state using plugins
// - plan file changes
// - apply file operations
export type Project<T extends Parser> = {
  loadState: () => Promise<Files<T>>
  reloadFile: (path: string, state: Files<T>) => Promise<Files<T>>
  transform: (state: Files<T>) => Files<T>
  plan: (state: Files<T>, desiredState: Files<T>) => Promise<FileOp[]>
  apply: (ops: FileOp[]) => Promise<void>
}

// Instructions to change a file.
export type FileOp = (
  | { type: "write"; content: string }
  | { type: "remove" }
  | { type: "ignore" }
) & { path: string }
