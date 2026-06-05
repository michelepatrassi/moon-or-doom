---
type: ADR
id: "0009"
title: "Prefer Tailwind default utility scale"
status: active
date: 2026-05-29
---

## Context

Moon or Doom uses Tailwind utility classes directly in React components. Tailwind also allows arbitrary values such as `h-[132px]` or `border-[#2B2D36]`, which can be useful for exact design translation.

Arbitrary values make the code harder to scan and can slowly create a custom design scale inside component markup. For this project, readability and simple maintenance matter more than pixel-perfect matching.

## Decision

**Prefer Tailwind's default spacing, sizing, color, typography, border, and shadow utilities before using arbitrary values.**

Use arbitrary values only when the default Tailwind scale cannot express the requirement clearly or when exact values are strictly necessary for a concrete product reason.

## Options considered

- **Tailwind default utility scale** (chosen): keeps class names recognizable, reduces one-off values, and supports the existing KISS and Tailwind styling decisions.
- **Arbitrary Tailwind values for close design matching**: useful for pixel-perfect implementation, but makes component classes noisier and creates more values to reason about.
- **Custom theme tokens**: can provide strong consistency in a mature design system, but adds configuration overhead before the app needs it.

## Consequences

Components should use classes like `h-32`, `border-zinc-800`, `bg-green-900`, and `shadow-xl` when those values are close enough to the intended design.

Design implementation may be visually approximate instead of pixel-perfect. This is acceptable when the component still communicates the intended hierarchy, state, and interaction clearly.

Arbitrary values remain allowed for cases where Tailwind defaults are not close enough, where layout breaks without exact dimensions, or where an externally defined asset or brand requirement demands a specific value.

Re-evaluate this decision if the product develops a formal design token system or if repeated approximate Tailwind values become less readable than named theme tokens.
