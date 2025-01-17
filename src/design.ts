import { Config, CoreConfig } from "./config"

// The constraints placed on the design of the project.
export type Engine<T extends Codecs = Codecs> = (
  effects: Effects,
) => (cxt: Context<T>) => Project<T>

// Side effect operations on the environment.
export type Effects = {
  file: {
    listAll: (path: string) => Promise<string[]>
    read: (path: string) => Promise<string>
    write: (path: string, content: string) => Promise<void>
    delete: (path: string) => Promise<void>
    exists: (path: string) => Promise<boolean>
  }
  dir: {
    exists: (path: string) => Promise<boolean>
  }
  git: {
    init: () => Promise<void>
    ignore: (path: string) => Promise<void>
  }
}

// Options to customise behaviour of tsi
type Options = {
  git: boolean
  install: boolean
}

// Runtime context for the project.
export type Context<T extends Codecs = Codecs> = {
  cwd: string
  codecs: T
  extensions: Extension<T>[]
  command: string
  options: Options
}

// Abstracts away file encoding and decoding.
export type Codec<T extends Object> = {
  decode: (content: string) => T
  encode: (data: T) => string
  take: (files: string[]) => boolean
  is: (data: any) => boolean
}

// Collection of codecs for different file types.
export type Codecs = {
  [name: string]: Codec<any>
}

// State of a single file translated using codecs.
export type Meta<T extends Codecs = Codecs> = {
  [K in keyof T]?: ReturnType<T[K]["decode"]>
}

// State of project translated using codecs.
export type Files<T extends Codecs = Codecs> = {
  [filename: string]: Meta<T>
}

// Project extension to transform or plan file changes.
export type Extension<T extends Codecs = Codecs> = {
  parse?: (path: string) => (keyof T)[]
  capture?: (files: Files<T>, cxt: Context) => Partial<Config>
  transform?: (files: Files<T>, config: CoreConfig, cxt: Context) => Files<T>
}

// Project API
// - load current state
// - reload file, apply state changes
// - transform state
// - plan file changes
// - apply file operations
export type Project<T extends Codecs = Codecs> = {
  context: Context<T>
  loadState: () => Promise<Files<T>>
  reloadFile: (path: string, state: Files<T>) => Promise<Files<T>>
  transform: (state: Files<T>) => Files<T>
  plan: (state: Files<T>, desiredState: Files<T>) => Promise<Operation[]>
  apply: (ops: Operation[]) => Promise<void>
}

// Limited set of instructions to effect change.
export type Operation =
  | { type: "write"; path: string; content: string }
  | { type: "remove"; path: string }
  | { type: "ignore"; path: string }
  | { type: "gitInit" }
