---
id: ai-decomposition
type: task
title: AI-Assisted Documentation Decomposition
relationships:
  - implements: ai-generated-foundation
  - requires: knowledge-object
  - requires: markdown-first
---

A thin script (`tools/decompose.js`) and a crafted prompt that feed source documentation to Claude and receive back draft knowledge objects conforming to the Markdown schema. Outputs are written to `content/` and validated by running `make generate`. The human reviews and accepts the draft before committing.
