---
type: ADR
id: "0003"
title: "Use Tailwind CSS for styling"
status: active
date: 2026-06-05
---

## Context

The project needs a consistent styling approach for React components that is easy to read in code and easy to debug in the browser.

Tailwind CSS is already part of the project setup through the Next.js scaffold, so using it does not add another styling dependency or extra setup burden. Its utility-first model makes applied styles visible at the component level and allows developers to toggle individual classes directly in browser dev tools while debugging.

## Decision

**Use Tailwind CSS utility classes as the default styling approach. Component styling should happen with Tailwind classes in `className` by default.**

Custom CSS classes, CSS modules, and raw style attributes should be avoided unless they solve a concrete problem that Tailwind utilities cannot express cleanly.

## Options considered

- **Tailwind utility classes** (chosen): keeps styling close to the component markup, makes applied styles explicit, supports composition without inventing project-specific class names, and is already bundled with the current Next.js setup.
- **Custom CSS classes or CSS modules**: can work well for larger handcrafted design systems, but can hide the final applied styles behind separate files and make debugging require more context switching.
- **Raw style attributes**: make styles local to the element, but bypass Tailwind conventions, reduce reuse through utility composition, and make responsive, state-based, and theme-aware styling harder to keep consistent.

## Consequences

Components should be styled primarily by composing Tailwind utilities in `className`. This keeps the codebase consistent and makes it clear which visual rules apply to each element without jumping between markup and separate CSS files.

Browser debugging is simpler because individual Tailwind classes can be enabled, disabled, or adjusted directly in dev tools.

The tradeoff is that component markup may contain longer `className` values. This is acceptable when it preserves local readability. Reusable component abstractions may be introduced when repeated utility combinations become a real maintenance cost.

Primitive CSS should remain limited to global concerns, framework integration, browser resets, Tailwind directives, CSS variables, or styling cases that cannot be represented clearly with Tailwind utilities.

Re-evaluate this decision if Tailwind stops fitting the product's styling needs, if a dedicated design-system layer becomes necessary, or if another styling approach provides a clear maintainability advantage without adding disproportionate setup cost.
