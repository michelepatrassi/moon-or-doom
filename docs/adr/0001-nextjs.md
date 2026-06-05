---
type: ADR
id: "0001"
title: "Use Next.js for the React application"
status: active
date: 2026-06-05
---

## Context

The application needs a solid starting point for a React-based product without spending early project time assembling routing, rendering, bundling, and deployment conventions from separate tools.

The project also benefits from server-side rendering because public pages may need to be discoverable and indexable by search engines. Deployment should stay simple and predictable for a small application.

## Decision

**Use Next.js as the primary React framework for the application.**

## Options considered

- **Next.js** (chosen): provides an opinionated React framework with routing, rendering, build tooling, and production conventions included. Built-in server-side rendering supports SEO needs, and deployment to Vercel is straightforward.
- **React with Vite**: gives a fast and lightweight client-side React setup, but would require separate decisions for routing, SSR, SEO behavior, and deployment conventions.
- **Custom React SSR setup**: could be tailored exactly to the application, but would add avoidable framework and infrastructure work at this stage.

## Consequences

Next.js gives the project a strong default structure and reduces setup decisions for a React application. The team can rely on framework conventions for routing, rendering, bundling, and Vercel deployment.

Server-side rendering and metadata support make SEO-oriented pages easier to implement than in a purely client-rendered application.

The application is coupled to Next.js conventions and version-specific APIs. Because this project uses a recent Next.js version, contributors should check the local Next.js documentation before making framework-level changes.

Re-evaluate this decision if the application no longer needs SSR or SEO support, if deployment moves away from Vercel in a way that makes Next.js operationally costly, or if the framework constraints start blocking core product requirements.
