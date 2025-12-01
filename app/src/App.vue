<template>
  <div class="app">
    <header class="app-header">
      <h1>Problem Knowledge Graph</h1>
      <span v-if="loading" class="status">Loading…</span>
      <span v-else-if="error" class="status error">Error: {{ error }}</span>
      <span v-else class="status counts">{{ nodes.length }} nodes · {{ edges.length }} edges</span>
    </header>
    <main class="app-body">
      <div class="canvas">
        <GraphCanvas
          v-if="nodes.length"
          :nodes="nodes"
          :edges="edges"
          :selected-id="selected?.id ?? null"
          @select="onSelect"
        />
      </div>
      <aside class="panel">
        <template v-if="selected">
          <span class="node-type-badge">{{ selected.type }}</span>
          <h2 class="node-label">{{ selected.label }}</h2>
          <code class="node-id">{{ selected.id }}</code>
          <p v-if="selected.body" class="node-body">{{ selected.body }}</p>
          <h3 class="section-heading">Relationships</h3>
          <template v-if="selectedRelGroups.length">
            <div v-for="[verb, rels] in selectedRelGroups" :key="verb" class="rel-group">
              <h4 class="rel-verb-heading">{{ verb }}</h4>
              <ul class="rel-list">
                <li v-for="(r, i) in rels" :key="i" class="rel-item">
                  <span class="rel-dir">{{ r.dir === 'out' ? '→' : '←' }}</span>
                  <button class="rel-other" @click="navigateTo(r.otherId)">{{ r.otherLabel }}</button>
                </li>
              </ul>
            </div>
          </template>
          <p v-else class="empty">No relationships</p>
        </template>
        <template v-else>
          <p class="placeholder">Select a node to see details</p>
          <h3 class="section-heading">Node types</h3>
          <ul class="legend">
            <li v-for="[type, color] in presentTypes" :key="type" class="legend-item">
              <span class="legend-dot" :style="{ background: color }"></span>
              <span>{{ type }}</span>
            </li>
          </ul>
        </template>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGraph } from './composables/useGraph.js'
import { TYPE_COLORS } from './typeColors.js'
import GraphCanvas from './components/GraphCanvas.vue'

const { nodes, edges, loading, error, loadGraph } = useGraph()
const selected = ref(null)

const selectedColor = computed(() => TYPE_COLORS[selected.value?.type] ?? '#6b7280')

const selectedRelGroups = computed(() => {
  if (!selected.value) return []
  const id = selected.value.id
  const all = [
    ...edges.value
      .filter((e) => e.source === id)
      .map((e) => ({ dir: 'out', relation: e.relation, otherId: e.target, otherLabel: nodeLabel(e.target) })),
    ...edges.value
      .filter((e) => e.target === id)
      .map((e) => ({ dir: 'in', relation: e.relation, otherId: e.source, otherLabel: nodeLabel(e.source) })),
  ]
  const grouped = {}
  for (const r of all) {
    if (!grouped[r.relation]) grouped[r.relation] = []
    grouped[r.relation].push(r)
  }
  return Object.entries(grouped)
})

const presentTypes = computed(() =>
  Object.entries(TYPE_COLORS).filter(([t]) => nodes.value.some((n) => n.type === t)),
)

function nodeLabel(id) {
  return nodes.value.find((n) => n.id === id)?.label ?? id
}

function navigateTo(id) {
  selected.value = nodes.value.find((n) => n.id === id) ?? null
}

function onSelect(data) {
  if (!data) {
    selected.value = null
    return
  }
  selected.value = nodes.value.find((n) => n.id === data.id) ?? null
}

onMounted(loadGraph)
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: sans-serif;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: #1a1a2e;
  color: #e0e0e0;
  flex-shrink: 0;
}

.app-header h1 {
  font-size: 1.1rem;
  margin: 0;
}

.status {
  font-size: 0.875rem;
  color: #a0a0c0;
}

.error {
  color: #f87171;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.canvas {
  flex: 1;
  background: #0f0f1a;
  overflow: hidden;
}

.panel {
  width: 280px;
  flex-shrink: 0;
  border-left: 1px solid #2a2a4a;
  background: #12122a;
  padding: 1rem;
  overflow-y: auto;
}

.placeholder {
  color: #404060;
  margin: 0 0 1rem;
  font-size: 0.85rem;
}

.node-type-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: v-bind(selectedColor);
  border: 1px solid v-bind(selectedColor);
  margin-bottom: 0.5rem;
}

.node-label {
  font-size: 0.95rem;
  color: #e0e0e0;
  margin: 0 0 0.25rem;
  font-weight: 600;
  line-height: 1.3;
  word-break: break-word;
}

.node-id {
  display: block;
  font-size: 0.72rem;
  color: #505080;
  font-family: monospace;
  margin-bottom: 0.5rem;
  word-break: break-all;
}

.node-body {
  font-size: 0.8rem;
  color: #9090b0;
  line-height: 1.5;
  margin: 0.5rem 0 0;
}

.section-heading {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #505080;
  margin: 1rem 0 0.5rem;
  font-weight: 600;
}

.rel-group {
  margin-bottom: 0.75rem;
}

.rel-verb-heading {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6870a0;
  font-style: italic;
  font-weight: 500;
  margin: 0 0 0.3rem;
}

.rel-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.rel-item {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  font-size: 0.8rem;
  line-height: 1.3;
}

.rel-dir {
  color: #404060;
  flex-shrink: 0;
  width: 1em;
  text-align: center;
}

.rel-other {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #7080c0;
  font-size: 0.8rem;
  text-align: left;
  flex: 1;
  text-decoration: underline;
  text-decoration-color: #404060;
  text-underline-offset: 2px;
}

.rel-other:hover {
  color: #a0b0e0;
  text-decoration-color: #7080c0;
}

.empty {
  font-size: 0.8rem;
  color: #404060;
  margin: 0.25rem 0 0;
}

.legend {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #8080a0;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
