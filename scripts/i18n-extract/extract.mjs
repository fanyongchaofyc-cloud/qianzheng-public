import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const LOCALES = ['zh-CN', 'en', 'ja', 'ko']
const KEY_RE = /\bt\(\s*(['"])([^'"]+)\1\s*\)/g

export function collectKeys (source) {
  const keys = new Set()
  for (const match of source.matchAll(KEY_RE)) {
    keys.add(match[2])
  }
  return [...keys].sort()
}

async function walk (dir, exts = ['.ts', '.tsx']) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...await walk(full, exts))
    } else if (exts.includes(path.extname(entry.name))) {
      out.push(full)
    }
  }
  return out
}

function parseArgs (argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--self-test') args.selfTest = true
    else if (arg === '--root') args.root = argv[++i]
    else if (arg === '--locales') args.locales = argv[++i]
  }
  return args
}

async function run () {
  const args = parseArgs(process.argv.slice(2))
  if (args.selfTest) {
    const keys = collectKeys("t('hello'); t(\"world\"); t('hello')")
    if (JSON.stringify(keys) !== JSON.stringify(['hello', 'world'])) {
      console.error('self-test failed')
      process.exit(1)
    }
    console.log('self-test passed')
    return
  }

  const root = args.root
  const localesDir = args.locales
  const files = await walk(root)
  const keys = new Set()
  for (const file of files) {
    const source = await readFile(file, 'utf8')
    for (const key of collectKeys(source)) keys.add(key)
  }

  for (const locale of LOCALES) {
    const file = path.join(localesDir, `${locale}.json`)
    const current = JSON.parse(await readFile(file, 'utf8'))
    for (const key of keys) {
      if (!(key in current)) current[key] = ''
    }
    await writeFile(file, JSON.stringify(current, null, 2) + '\n')
  }

  const union = keys.size > 0
    ? [...keys].sort().map(key => `  | ${JSON.stringify(key)}`).join('\n')
    : '  | never'
  const keysFile = path.join(path.dirname(localesDir), 'src', 'keys.ts')
  await writeFile(keysFile, `export type I18nKey =\n${union}\n`)
  console.log(`extracted ${keys.size} keys`)
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
