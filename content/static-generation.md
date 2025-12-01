---
id: static-generation
type: decision
title: Static Generation at Build Time
relationships:
  - constrains: vue-frontend
  - constrains: graph-generator
---

AI processing and graph generation occur at build time rather than at runtime. The frontend consumes pre-built static artifacts, eliminating the need for a persistent backend service or live inference endpoint.
