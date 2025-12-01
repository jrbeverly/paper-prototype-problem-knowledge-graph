---
id: incremental-understanding
type: requirement
title: Incremental Understanding
relationships:
  - constrains: knowledge-object
  - constrains: graph-generator
---

The graph must be able to grow alongside the project without requiring wholesale redesign. New objects, relationships, and corrected understanding should be incorporable by editing or adding Markdown files and re-running the generator. The graph represents current understanding, not a frozen architectural snapshot.
