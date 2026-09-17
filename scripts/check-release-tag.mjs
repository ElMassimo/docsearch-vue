import { readFile } from 'node:fs/promises'

const packageMetadata = JSON.parse(await readFile('package.json', 'utf8'))
const expectedTag = `v${packageMetadata.version}`
const actualTag = process.env.GITHUB_REF_NAME

if (actualTag !== expectedTag) {
  console.error(`Release tag ${actualTag ?? '(missing)'} does not match ${expectedTag}.`)
  process.exitCode = 1
} else {
  console.log(`Release tag ${actualTag} matches package version.`)
}
