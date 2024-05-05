// The constraints placed on the design of the project.
export type Engine<T extends Config<Parser> = Config<Parser>> = (
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
  dir: {
    exists: (path: string) => Promise<boolean>
  }
  git: {
    init: () => Promise<void>
    ignore: (path: string) => Promise<void>
  }
}

// Runtime configuration for a project.
export type Config<T extends Parser = Parser> = {
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
export type Schema<T extends Parser = Parser> = {
  [K in keyof T]?: ReturnType<T[K]["parse"]>
}

// State of project translated using codecs.
export type Files<T extends Parser = Parser> = {
  [filename: string]: Schema<T>
}

// Transform project state using plugins.
export type Transform<T extends Parser = Parser> = (s: Files<T>) => Files<T>

// Project API
// - load current state
// - reload file, apply state changes
// - transform state using plugins
// - plan file changes
// - apply file operations
export type Project<T extends Parser = Parser> = {
  loadState: () => Promise<Files<T>>
  reloadFile: (path: string, state: Files<T>) => Promise<Files<T>>
  transform: (state: Files<T>) => Files<T>
  plan: (state: Files<T>, desiredState: Files<T>) => Promise<Operation[]>
  apply: (ops: Operation[]) => Promise<void>
}

// Instructions to effect changes on the file system.
export type Operation =
  | { type: "write"; path: string; content: string }
  | { type: "remove"; path: string }
  | { type: "ignore"; path: string }
  | { type: "gitInit" }
