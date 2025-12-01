# Knowledge Object Schema

One Markdown file = one concept.

Front matter carries structured fields the graph generator can parse.
The body carries human-readable narrative — paragraphs, lists, headings, whatever
the author finds useful.

---

## Front matter fields

| Field           | Required | Description                                                  |
| --------------- | -------- | ------------------------------------------------------------ |
| `id`            | yes      | Stable slug, unique across the graph (lowercase, hyphens).   |
| `type`          | yes      | Concept category — see below.                                |
| `title`         | yes      | Short human-readable label.                                  |
| `relationships` | no       | List of typed edges to other objects, referenced by `id`.    |

### Types

Open-ended. Seed vocabulary:

`system` · `service` · `api` · `persona` · `decision` · `risk` ·
`requirement` · `task` · `workflow` · `infrastructure`

Add new types as the domain requires.

### Relationships

Each entry is a YAML mapping with one key (the verb) and one value (the target `id`).
Multiple entries are allowed; the list may mix different verbs.

Seed vocabulary (from the vision):

| Verb              | Meaning                                       |
| ----------------- | --------------------------------------------- |
| `depends_on`      | Cannot function without the target.           |
| `owns`            | Is responsible for the target.                |
| `implements`      | Fulfils or realises the target.               |
| `references`      | Cites or links to the target for context.     |
| `constrains`      | Limits or bounds the target's behaviour.      |
| `communicates_with` | Exchanges data or events with the target.   |
| `replaces`        | Supersedes the target.                        |
| `requires`        | Depends on the target to exist or be true.    |
| `validates`       | Verifies correctness of the target.           |
| `documents`       | Provides human explanation of the target.     |

Add new verbs freely — the vocabulary is intentionally open-ended.

---

## Examples

### Minimal object

```markdown
---
id: payments-api
type: api
title: Payments API
---

Handles payment authorisation and settlement for all customer-facing flows.
Exposes a REST interface; events are published to the `payments` Kafka topic.
```

### Object with relationships

```markdown
---
id: checkout-service
type: service
title: Checkout Service
relationships:
  - depends_on: payments-api
  - depends_on: inventory-service
  - implements: checkout-flow-requirement
  - owns: cart-session
---

Orchestrates the end-to-end purchase flow: cart assembly, stock reservation,
payment authorisation, and order confirmation.

## Assumptions

- Payment failures are terminal — no automatic retry at this layer.
- Inventory locks expire after 10 minutes if checkout is abandoned.
```

---

## File conventions

- File name should match `id` (e.g. `checkout-service.md`).
- Files live in `content/` or subdirectories of it.
- Extra front matter fields beyond those above are permitted; the schema is
  intentionally permissive and will evolve as the project learns.
