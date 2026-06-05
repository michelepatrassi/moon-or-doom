# Architecture Decision Records

This folder contains Architecture Decision Records (ADRs).

## Format

Each ADR is a markdown note with YAML frontmatter. Template:

```markdown
---
type: ADR
id: "0001"
title: "Short decision title"
status: proposed # proposed | active | superseded | retired
date: YYYY-MM-DD
superseded_by: "0007" # only if status: superseded
---

## Context

What situation led to this decision? What forces and constraints are at play?

## Decision

**What was decided.** State it clearly in one or two sentences — bold so it stands out.

## Options considered

- **Option A** (chosen): brief description — pros / cons
- **Option B**: brief description — pros / cons
- **Option C**: brief description — pros / cons

## Consequences

What becomes easier or harder as a result?
What are the positive and negative ramifications?
What would trigger re-evaluation of this decision?

## Advice

_(optional)_ Input received before making this decision — who was consulted, what they said, when.
Omit if the decision was made unilaterally with no external input.
```

### Status lifecycle

```
proposed → active → superseded
                 ↘ retired      (decision no longer relevant, not replaced)
```

## Rules

- One decision per file
- Files named `NNNN-short-title.md` (monotonic numbering)
- Once `active`, never edit — supersede instead
- When superseded: update `status: superseded` and add `superseded_by: "NNNN"`
- ARCHITECTURE.md reflects the current state (active decisions only)

## Index

| ID                     | Title        | Status |
| ---------------------- | ------------ | ------ |
| [0001](0001-nextjs.md) | NextJS stack | active |
| [0002](0002-npm-package-manager.md) | npm package manager | active |
| [0003](0003-tailwind-styling.md) | Tailwind styling | active |
| [0004](0004-kraken-market-data-api.md) | Kraken BTC/USD market data API | active |
| [0005](0005-kiss-code-simplicity.md) | KISS code simplicity | active |
| [0006](0006-react-component-declarations.md) | React component declarations | active |
| [0007](0007-unit-test-isolated-frontend-functions.md) | Unit test isolated frontend functions | active |
| [0008](0008-clsx-classname-composition.md) | clsx className composition | active |
| [0009](0009-tailwind-default-utility-scale.md) | Tailwind default utility scale | active |
| [0010](0010-dynamodb-player-score-persistence.md) | DynamoDB player score persistence | active |
