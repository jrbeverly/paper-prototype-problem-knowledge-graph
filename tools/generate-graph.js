import { mkdirSync, readFileSync, readdirSync, writeFileSync, statSync } from 'fs'
import { join, extname, dirname } from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT_DIR = join(ROOT, 'content')
const OUTPUT_FILE = join(ROOT, 'app', 'public', 'graph.json')

function collectMarkdownFiles(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath))
    } else if (extname(entry) === '.md') {
      files.push(fullPath)
    }
  }
  return files
}

function buildGraph(files) {
  const nodes = []
  const nodeIds = new Set()
  const pendingEdges = []

  for (const file of files) {
    const { data, content } = matter(readFileSync(file, 'utf8'))
    const { id, type, title, relationships = [] } = data

    if (!id || !type || !title) {
      console.warn(`[warn] ${file}: missing id, type, or title — skipping`)
      continue
    }

    const body = content.trim()
    nodes.push({ id, type, label: title, ...(body ? { body } : {}) })
    nodeIds.add(id)

    for (const rel of relationships) {
      const verb = Object.keys(rel)[0]
      pendingEdges.push({ source: id, relation: verb, target: rel[verb] })
    }
  }

  const edges = []
  for (const { source, relation, target } of pendingEdges) {
    if (!nodeIds.has(target)) {
      console.warn(`[warn] edge ${source} --${relation}--> ${target}: unknown target — skipping`)
      continue
    }
    edges.push({ id: `${source}__${relation}__${target}`, source, target, relation })
  }

  return { nodes, edges }
}

const graph = buildGraph(collectMarkdownFiles(CONTENT_DIR))
mkdirSync(dirname(OUTPUT_FILE), { recursive: true })
writeFileSync(OUTPUT_FILE, JSON.stringify(graph, null, 2) + '\n')
console.log(`[generate] ${graph.nodes.length} nodes, ${graph.edges.length} edges → ${OUTPUT_FILE}`)
