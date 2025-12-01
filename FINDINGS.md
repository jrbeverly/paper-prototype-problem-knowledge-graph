# MVP Findings

Retrospective on the first iteration against the experimentation questions from
`VISION.md`.

---

## How effectively can AI decompose large problem domains?

- Decomposition of `VISION.md` (a well-structured doc) produced 17 coherent
  objects with sensible types and relationships on the first pass — usable
  without heavy manual correction.
- Quality depends heavily on input structure. A prose-heavy or ambiguous source
  will produce noisier objects.
- The body narrative goes stale quickly. `graph-generator.md` still says "not
  yet implemented" after the generator shipped. Front matter (id, type,
  relationships) stays accurate; prose does not.
- **Signal:** AI decomposition works for bootstrapping. It does not replace
  ongoing maintenance.

## What level of structure produces the best AI reasoning?

- The minimal schema — `id`, `type`, `title`, `relationships` — was sufficient.
  No additional structured fields were needed for the seed graph.
- Open-ended types (`task`, `risk`, `decision`, …) proved fine for a small graph.
  At scale they create inconsistency without a controlled vocabulary.
- Narrative bodies added almost no value in this iteration. They duplicate what
  the title and relationships already express.
- **Signal:** Less structured prose, more relationship coverage.

## Which relationships provide the greatest value?

- `implements`, `depends_on`, `requires`, and `constrains` carry clear directed
  meaning and were used consistently.
- `references` is too weak — it signals "these are related" without saying how.
- `documents` was unused; the concept exists but no object exercised it.
- Verb ambiguity: `requires` vs `depends_on` overlap significantly and were used
  interchangeably across objects.
- **Signal:** Reduce to ~5 canonical verbs; deprecate or merge the rest.

## How much information should remain structured vs. narrative?

- For this seed graph: most of the understanding lived in the front matter.
  Narrative bodies were 1–4 sentences that restated the title.
- The stale-prose problem (above) suggests narrative should be the exception,
  not the default.
- **Signal:** Structured front matter is the source of truth. Bodies are optional
  annotations, not required fields.

## Can documentation become significantly easier to navigate through explicit modeling?

- The data model is sound — `graph.json` is correct, edges are validated at
  generation time.
- The Vue frontend currently shows a node/edge count and two placeholder divs.
  There is nothing to navigate yet.
- This question is unanswered until a visualization exists.
- **Signal:** The biggest open risk is that the graph is useful in theory but
  unproven in practice. Visualization is the next critical experiment.

---

## Keep / Cut / Simplify

### Keep

- **Markdown-first authoring.** Version-controlled, portable, AI-friendly.
  Proved out in practice.
- **Minimal schema.** `id + type + title + relationships` is enough. Resist
  adding fields until a concrete use case demands them.
- **Static generation at build time.** No backend required, CI validates it,
  and `make generate` is fast.
- **AI decomposition tool (`decompose.js`).** Useful for bootstrapping new
  graphs; worth keeping in the toolchain.
- **Edge validation at generation time.** The generator warns on unknown targets
  and skips the edge. Keep this; it's the first line of defense against drift.

### Cut

- **`task`-typed knowledge objects.** `implement-graph-generator.md` and
  `implement-graph-visualization.md` are better tracked as issues/tickets.
  Tasks have a lifecycle (open → done → stale) that the graph doesn't model.
  They pollute the graph with ephemeral state.
- **Narrative bodies as a required convention.** The schema doc implies every
  object should have a body. Most bodies added noise. Make them optional.

### Simplify

- **Relationship vocabulary.** Merge `requires` and `depends_on` into one verb.
  Drop `references` unless a concrete use demands it. Target: 5 verbs max for
  the next iteration.
- **`useGraph.js` module-level state.** Module-level refs work but make the
  composable a hidden singleton. For an MVP this is fine, but note it for when
  multiple graphs are needed.

---

## Over-engineered flags

- The devcontainer pulls in .NET 8 + Aspire, Terraform, and Hugo — none of
  which the current app uses. This is inherited from the template, not from
  deliberate choices, but it inflates container build time.
- The `decompose.js` fence-stripping regex (`/^```(?:json)?\s*/i`) is more
  defensive than necessary against the current model. Acceptable, but note it
  is cargo-culted robustness, not observed need.

---

## Next iteration recommendations

1. **Add a graph visualization.** Even a basic force-directed or tree layout
   proves or disproves the navigability hypothesis. This is the most important
   outstanding experiment.
2. **Validate front matter at generation time.** Check that `id`, `type`, and
   `title` are present and that `id` matches the filename. Catches drift early.
3. **Remove or archive stale task objects.** Delete `implement-graph-generator.md`
   (done) and move `implement-graph-visualization.md` to a ticket.
4. **Tighten the relationship vocabulary.** Merge `requires`/`depends_on` and
   remove `references` from the seed vocabulary before the graph grows.
5. **Drop required narrative bodies.** Update `SCHEMA.md` to make the body
   explicitly optional.
