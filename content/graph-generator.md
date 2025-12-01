---
id: graph-generator
type: service
title: Graph Generator
relationships:
  - implements: graph-json-api
  - requires: knowledge-object
---

Build-time script in `tools/` that parses Markdown knowledge objects from `content/` and emits the static `graph.json` artifact consumed by the frontend. Not yet implemented; currently replaced by a hand-authored placeholder.
