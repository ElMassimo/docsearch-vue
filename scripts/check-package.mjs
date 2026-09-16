import { execFileSync } from 'node:child_process'

const env = { ...process.env }
delete env.npm_config_approve_builds
delete env.npm_config_store_dir

const output = execFileSync('npm', ['pack', '--dry-run', '--json'], {
  encoding: 'utf8',
  env
})
const pack = JSON.parse(output)[0]
const paths = new Set(pack.files.map((file) => file.path))
const required = [
  'LICENSE',
  'NOTICE',
  'README.md',
  'CHANGELOG.md',
  'dist/index.js',
  'dist/index.d.ts',
  'dist/style.css'
]

for (const path of required) {
  if (!paths.has(path)) throw new Error(`Packed package is missing ${path}`)
}
if ([...paths].some((path) => path.startsWith('dist/src/'))) {
  throw new Error('Declarations must be emitted at dist/, not dist/src/.')
}

console.log(`${pack.id}: ${pack.entryCount} files, ${pack.size} bytes packed`)
