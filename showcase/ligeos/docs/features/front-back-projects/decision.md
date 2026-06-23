# Decision for Front and Back Project Scaffold

## Selected Option

Option 4: `Vite + Svelte` for frontend, `Node.js + Fastify + TypeScript` for backend.

## Decision Summary

We choose Option 4 because it best balances the three main goals:
- Simplicity in day-to-day development.
- High backend performance.
- Clean future path to AWS serverless deployment.

Svelte keeps frontend implementation lightweight and easy to maintain, while Fastify provides strong API performance with low overhead. Keeping a TypeScript/Node.js stack across both applications improves consistency and reduces cognitive load.

## Decision Drivers

- Backend speed is a top priority, and Fastify is better aligned with this than Express.
- Future AWS serverless deployment is a hard requirement, and Fastify has a clear Lambda adaptation path.
- The team wants a structured project with clear boundaries and long-term maintainability.
- A mostly homogeneous stack reduces tooling complexity versus mixed-language alternatives.

## Why Other Options Were Not Chosen

### Option 1: Vite + React + Fastify + TypeScript
- Strong option and close second.
- Not selected because Svelte provides a leaner frontend code model with less boilerplate for this project.
- Both options satisfy performance and serverless goals on the backend.

### Option 2: Vite + Svelte + Express + TypeScript
- Good frontend simplicity.
- Not selected because Express is less performance-oriented than Fastify and less aligned with the server speed priority.

### Option 3: Vite + React + Python FastAPI
- Technically viable and performant.
- Not selected because introducing a second language/runtime increases operational and tooling complexity.
- This goes against the goal of maximizing simplicity and delivery speed for this team.

## Consequences

- The team needs a short onboarding baseline for Svelte and Fastify conventions.
- Repository structure should keep strict separation between frontend and backend while allowing controlled shared TypeScript modules.
- Implementation should preserve stateless backend behavior to keep Lambda migration straightforward.

## Status
- `Approved` (2026-04-13)
