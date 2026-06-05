---
type: ADR
id: "0008"
title: "Use clsx for className composition"
status: active
date: 2026-05-29
---

## Context

Moon or Doom uses Tailwind utility classes for component styling. Some components also accept a `className` prop or choose classes from variants. Plain string interpolation makes these cases harder to read as conditions and variants grow, and it can accidentally replace required base classes instead of composing with them.

`clsx` provides a small, focused API for composing class names from strings, arrays, and conditional objects.

## Decision

**Use `clsx` when composing `className` values from base classes, variants, optional input classes, or conditional classes.**

Static class strings can remain plain strings. Reach for `clsx` when a component accepts `className`, combines variant classes, or needs conditional classes.

## Options considered

- **Use `clsx` for composed classes** (chosen): keeps component class composition readable without adding a custom helper.
- **Manual string interpolation**: works for simple cases, but becomes harder to scan and can produce awkward spacing or missing base classes.
- **Custom className helper**: unnecessary while `clsx` covers the current needs with a standard API.

## Consequences

Components that accept `className` should append it through `clsx` rather than replacing base styles by default. Variant classes should be passed as separate `clsx` arguments instead of interpolated into template strings.

This decision does not require wrapping every static class string in `clsx`. Keeping plain strings for static markup is simpler and consistent with the KISS ADR.
