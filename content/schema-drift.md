---
id: schema-drift
type: risk
title: Schema Drift
relationships:
  - references: knowledge-object
  - references: graph-generator
---

The content schema (front matter fields and relationship verbs) may diverge from what the generator expects as the project evolves, causing silent data loss or parse failures. Mitigation: validate front matter against a published schema during generation.
