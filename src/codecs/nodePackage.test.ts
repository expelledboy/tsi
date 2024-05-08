import fs from "fs"
import path from "path"
import { nodePackage } from "./nodePackage"

const tsiPackageStr = fs.readFileSync(path.join(__dirname, "../../package.json"), "utf-8")

describe("nodePackage codec", () => {
  it('decodes and encodes a "package.json" file', () => {
    const packageJson = nodePackage.decode(tsiPackageStr)

    expect(packageJson).toBeDefined()
    expect(packageJson.dependencies).toBeDefined()

    const encoded = nodePackage.encode(packageJson)
    expect(encoded).toBe(tsiPackageStr)
  })

  it("validates package.json content", () => {
    expect(nodePackage.is(nodePackage.decode(tsiPackageStr))).toBe(true)
  })

  it("allow optional fields to be missing", () => {
    expect(
      nodePackage.is({
        name: "minimal-package",
      }),
    ).toBe(true)
  })

  it("reject invalid package.json", () => {
    const invalidPackage = {
      name: 123,
      version: true,
      main: {},
      dependencies: "not-an-object",
      devDependencies: "also-not-an-object",
    }
    expect(nodePackage.is(invalidPackage)).toBe(false)
  })
})
