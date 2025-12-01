# Tools

Graph generator and content-authoring scripts live here.

---

## generate-graph.js

Reads every `.md` file in `content/`, parses its YAML front matter, and
writes the static `app/public/graph.json` artifact consumed by the frontend.

```
make generate
# or
node tools/generate-graph.js
```

Warnings are printed for files that are missing required fields (`id`, `type`,
`title`) or that reference an unknown target ID in a relationship.

---

## decompose.js

Feeds one or more source documents to Claude and receives back draft
knowledge objects conforming to the Markdown schema defined in
`content/SCHEMA.md`.  Each draft is written to `content/` for human review
before being committed.

### Prerequisites

Set the `ANTHROPIC_API_KEY` environment variable:

```
export ANTHROPIC_API_KEY=sk-ant-...
```

### Usage

```
# Decompose this repository's own docs (default)
make decompose

# Decompose specific files
make decompose DOCS="path/to/design-doc.md path/to/adr.md"

# Or call the script directly
node tools/decompose.js VISION.md README.md

# Overwrite files that already exist in content/
node tools/decompose.js VISION.md --overwrite
```

Override the model with `ANTHROPIC_MODEL` (default: `claude-sonnet-4-6`):

```
ANTHROPIC_MODEL=claude-opus-4-8 make decompose
```

### Workflow

1. Run `make decompose DOCS="<your-docs>"`.
2. Review the files written to `content/`.  Edit, rename, or delete as needed.
3. Run `make generate` — warnings indicate broken edge references to fix.
4. Run `make build` to confirm the full build passes.
5. Commit the content files you want to keep.

The script skips files that already exist in `content/` unless `--overwrite`
is passed, so it is safe to re-run iteratively on new source documents.
