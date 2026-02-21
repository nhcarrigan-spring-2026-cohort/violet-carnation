# AGENTS

This directory contains code for the client-side of a full stack app. This front-end app is a nextjs app written in typescript.
It is designed as a simple 1 month project with developers of multiple different levels of skill.

This is a sub folder, with a sibling folder called `api` which contains the server-side code.

## Technology used

- nextjs 16
- react 19
- typescript 5
- tailwindcss 4
- jest + testing-library (for testing)

## Other resources

- [CONTRIBUTING.md](../docs/CONTRIBUTING.md) - general guidelines for contributing to the project, including code style and commit message conventions and how to run the project.

## Testing

- Tests are defined next to source files using `.test.ts` or `.test.tsx` extensions
- Run tests with `npm test` or `npm run test:watch` for watch mode
- Jest is configured with Next.js and React Testing Library

## General Guidance

- always run `npm run lint:fix`, `npm run format`, `npm run check-types`, `npm test` and `npm run build` before committing code to ensure it is properly formatted, tested and linted.
