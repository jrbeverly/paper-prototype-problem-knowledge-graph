<template>
  <div ref="el" class="graph-canvas"></div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import cytoscape from 'cytoscape'
import { TYPE_COLORS } from '../typeColors.js'

const props = defineProps({
  nodes: { type: Array, required: true },
  edges: { type: Array, required: true },
  selectedId: { type: String, default: null },
})

const emit = defineEmits(['select'])

const el = ref(null)
let cy = null

onMounted(() => {
  cy = cytoscape({
    container: el.value,
    elements: [
      ...props.nodes.map((n) => ({ data: { id: n.id, label: n.label, type: n.type } })),
      ...props.edges.map((e) => ({
        data: { id: e.id, source: e.source, target: e.target, label: e.relation },
      })),
    ],
    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#6b7280',
          label: 'data(label)',
          color: '#d1d5db',
          'font-size': 10,
          'text-wrap': 'wrap',
          'text-max-width': 80,
          'text-valign': 'bottom',
          'text-margin-y': 4,
          width: 28,
          height: 28,
        },
      },
      ...Object.entries(TYPE_COLORS).map(([type, color]) => ({
        selector: `node[type = "${type}"]`,
        style: { 'background-color': color },
      })),
      {
        selector: 'node:selected',
        style: {
          'border-width': 3,
          'border-color': '#ffffff',
          'border-opacity': 1,
        },
      },
      {
        selector: 'edge',
        style: {
          width: 1.5,
          'line-color': '#3a3a5c',
          'target-arrow-color': '#3a3a5c',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          label: 'data(label)',
          'font-size': 8,
          color: '#6b6b9a',
          'text-rotation': 'autorotate',
          'text-background-color': '#0f0f1a',
          'text-background-opacity': 0.85,
          'text-background-padding': 2,
        },
      },
    ],
    layout: {
      name: 'cose',
      animate: false,
      padding: 24,
      nodeRepulsion: 6000,
      idealEdgeLength: 100,
    },
  })

  cy.on('tap', 'node', (evt) => {
    emit('select', evt.target.data())
  })

  cy.on('tap', (evt) => {
    if (evt.target === cy) emit('select', null)
  })
})

watch(
  () => props.selectedId,
  (id) => {
    if (!cy) return
    cy.elements().unselect()
    if (id) {
      const node = cy.getElementById(id)
      if (node.length) {
        node.select()
        cy.animate({ center: { eles: node }, duration: 250 })
      }
    }
  },
)

onUnmounted(() => {
  cy?.destroy()
})
</script>

<style scoped>
.graph-canvas {
  width: 100%;
  height: 100%;
}
</style>
