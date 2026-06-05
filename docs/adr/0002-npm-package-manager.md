---
type: ADR
id: "0002"
title: "Use npm as the package manager"
status: active
date: 2026-06-05
---

## Context

The project needs a package manager that is easy for contributors to use without adding setup steps beyond installing Node.js.

npm is bundled with Node.js, so anyone with the supported Node.js runtime can install dependencies and run project scripts without first installing or enabling another package manager. This keeps onboarding and local setup simple.

## Decision

**Use npm as the package manager for this repository.**

## Options considered

- **npm** (chosen): comes pre-installed with Node.js, requires no additional package-manager setup, and is sufficient for the current project structure.
- **Yarn**: remains a viable future option, but would require contributors to install or enable an additional tool before working with the repository.
- **pnpm**: remains a viable future option, especially if install performance, disk usage, or workspace needs become more important, but it also introduces an additional setup requirement.

## Consequences

Project setup stays straightforward: install Node.js, then use npm commands with the committed `package-lock.json`.

The repository avoids package-manager fragmentation by standardizing on one lockfile and one command set for dependency installation and scripts.

Yarn and pnpm are not ruled out. Re-evaluate this decision if the project grows into a workspace, if dependency install performance becomes a recurring issue, or if the team agrees that the benefits of another package manager outweigh the extra setup step.
