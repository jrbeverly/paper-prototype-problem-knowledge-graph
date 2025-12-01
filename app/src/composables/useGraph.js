import { ref, readonly } from 'vue'

const nodes = ref([])
const edges = ref([])
const loading = ref(false)
const error = ref(null)

export function useGraph() {
  async function loadGraph() {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/graph.json')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      nodes.value = data.nodes ?? []
      edges.value = data.edges ?? []
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return {
    nodes: readonly(nodes),
    edges: readonly(edges),
    loading: readonly(loading),
    error: readonly(error),
    loadGraph,
  }
}
