#!/usr/bin/env node
// Decomposes documentation into draft knowledge objects using Claude.
//
// Usage:
//   ANTHROPIC_API_KEY=<key> node tools/decompose.js <file> [<file> ...]
//
// Each source file is fed to Claude along with the schema and the list of
// existing knowledge-object IDs.  Claude returns a JSON array of draft
// objects; each one is written to content/ unless a file with that name
// already exists (use --overwrite to replace).
//
// Run 'make generate' afterward to rebuild the graph and check for broken edges.

import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs'
import { join, extname, dirname } from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT_DIR = join(ROOT, 'content')
const SCHEMA_FILE = join(CONTENT_DIR, 'SCHEMA.md')

// ── Parse CLI args ──────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const overwrite = args.includes('--overwrite')
const files = args.filter((a) => !a.startsWith('--'))

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('[decompose] error: ANTHROPIC_API_KEY is not set')
  process.exit(1)
}

if (files.length === 0) {
  console.error(
    '[decompose] error: no source files provided\n' +
      'Usage: node tools/decompose.js <file> [<file> ...] [--overwrite]',
  )
  process.exit(1)
}

// ── Collect existing IDs so the model avoids duplicating them ───────────────

function collectExistingIds(dir) {
  const ids = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      ids.push(...collectExistingIds(full))
    } else if (extname(entry) === '.md' && entry !== 'SCHEMA.md' && entry !== 'README.md') {
      try {
        const { data } = matter(readFileSync(full, 'utf8'))
        if (data.id) ids.push(data.id)
      } catch {
        // skip unparseable files
      }
    }
  }
  return ids
}

const existingIds = collectExistingIds(CONTENT_DIR)

// ── Read source docs ─────────────────────────────────────────────────────────

const sourceDocs = files
  .map((f) => {
    const absPath = join(ROOT, f)
    if (!existsSync(absPath)) {
      console.error(`[decompose] error: file not found: ${f}`)
      process.exit(1)
    }
    return `=== ${f} ===\n${readFileSync(absPath, 'utf8')}`
  })
  .join('\n\n')

const schema = readFileSync(SCHEMA_FILE, 'utf8')

// ── Prompt ───────────────────────────────────────────────────────────────────

const SYSTEM = `\
You are a knowledge graph architect. Your task is to decompose documentation
into structured knowledge objects that conform to the schema below.

${schema}

## Existing object IDs (do not create duplicates)

${existingIds.map((id) => `- ${id}`).join('\n')}

## Output format

Return a JSON array and nothing else — no prose, no markdown fences.
Each element must be an object with exactly two string keys:
  "filename"  — e.g. "ai-foundation.md" (file name only, no path)
  "content"   — full Markdown content including the YAML front matter block

Rules:
- Every object must have id, type, and title in its front matter.
- Add relationships wherever they are clearly supported by the source text.
  Reference both newly created objects and existing IDs listed above.
- Aim for 4–8 objects that together form a connected subgraph.
- Keep the narrative body to 2–4 sentences.`

const USER = `\
Decompose the following documentation into knowledge objects.
Extract the most important and distinct concepts; model their relationships explicitly.

${sourceDocs}`

// ── Call Claude ───────────────────────────────────────────────────────────────

const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6'
console.log(`[decompose] calling ${model} …`)

const client = new Anthropic()
const response = await client.messages.create({
  model,
  max_tokens: 8192,
  system: SYSTEM,
  messages: [{ role: 'user', content: USER }],
})

const raw = response.content[0].text

// Strip optional ```json ... ``` fences the model sometimes adds
const jsonText = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()

let objects
try {
  objects = JSON.parse(jsonText)
} catch {
  console.error('[decompose] error: response is not valid JSON — raw output:\n')
  console.error(raw)
  process.exit(1)
}

if (!Array.isArray(objects)) {
  console.error('[decompose] error: expected a JSON array at top level')
  process.exit(1)
}

// ── Write files ───────────────────────────────────────────────────────────────

let written = 0
let skipped = 0

for (const obj of objects) {
  if (typeof obj.filename !== 'string' || typeof obj.content !== 'string') {
    console.warn('[decompose] warn: skipping malformed entry:', JSON.stringify(obj))
    skipped++
    continue
  }

  const outPath = join(CONTENT_DIR, obj.filename)

  if (existsSync(outPath) && !overwrite) {
    console.log(`[decompose] skip  ${obj.filename} (already exists — use --overwrite to replace)`)
    skipped++
    continue
  }

  const content = obj.content.endsWith('\n') ? obj.content : obj.content + '\n'
  writeFileSync(outPath, content)
  console.log(`[decompose] wrote ${obj.filename}`)
  written++
}

console.log(`\n[decompose] ${written} written, ${skipped} skipped`)
console.log("[decompose] run 'make generate' to rebuild the graph")
