# Problem Knowledge Graph

> [!WARNING]
> **AI-authored:** This change was autonomously planned and implemented by an AI software factory from a human-authored specification, with possible subsequent human review or modification.

> [!WARNING]
> This experiment is effectively abandoned. The generated material is retained primarily as a research artifact.

An experimental knowledge graph platform that represents a system as interconnected objects — services, APIs, personas, risks, decisions — with explicit typed relationships. Knowledge is authored in structured Markdown; a build step compiles it into a static graph artifact consumed by a Vue.js frontend.

See [VISION.md](VISION.md) for the full rationale and [FINDINGS.md](FINDINGS.md) for iteration notes.

```sh
make install   # install Node dependencies
make build     # generate graph.json → build Vue app → dist/
make preview   # serve dist/ locally for inspection
```
