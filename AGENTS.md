<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

> Quick links: [Vision](docs/VISION.md) · [Abstractions](docs/ABSTRACTIONS.md) · [Wireframes](docs/wireframes/ui-design.pen)

# ADRs & docs

ADRs live in `docs/adr/`. Never edit existing — create a new one that supersedes. **When:** new dependency, storage strategy, core abstraction, cross-cutting pattern. **Not for:** bug fixes, styling, refactors.

# Design artifacts

Wireframes and product designs live only in `.pen` files under `docs/wireframes/`, primarily `docs/wireframes/ui-design.pen`. Do not create or commit PNG, PDF, WebP, JPEG, screenshot, or other rendered design exports unless the user explicitly asks for them. For visual checks, use Pencil screenshots in-session without writing export files to the repo.
