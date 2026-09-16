import { readFile } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'

const budgets = {
  'dist/index.js': 35 * 1024,
  'dist/style.css': 7 * 1024
}

let exceeded = false
for (const [file, budget] of Object.entries(budgets)) {
  const gzipBytes = gzipSync(await readFile(file)).byteLength
  const gzipKilobytes = (gzipBytes / 1024).toFixed(2)
  const budgetKilobytes = (budget / 1024).toFixed(0)
  console.log(`${file}: ${gzipKilobytes} kB gzip (budget ${budgetKilobytes} kB)`)
  if (gzipBytes > budget) exceeded = true
}

if (exceeded) {
  console.error('Bundle size budget exceeded.')
  process.exitCode = 1
}
