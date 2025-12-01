---
id: implement-graph-generator
type: task
title: Implement the Graph Generator
relationships:
  - implements: graph-generator
  - requires: knowledge-object
---

Build the `tools/` script that reads Markdown files from `content/`, parses their front matter, and writes `app/public/graph.json` in the format the frontend expects. This is the critical missing link between authored content and the visualization.
