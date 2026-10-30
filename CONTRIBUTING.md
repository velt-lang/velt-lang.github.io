# Contributing to the Velt website

Thanks for your interest! This repo holds the source for <https://veltlang.com/>: the Velt home page and the documentation. The compiler, runtime and standard library live in [`velt-lang/velt`](https://github.com/velt-lang/velt).

This is not a published package: it's a static site built with [`@sigx/ssg`](https://sigx.dev/ssg/) and deployed to GitHub Pages on every push to `main`.

## Prerequisites

- **Node.js** `^20.19.0` or `>=22.12.0`
- **pnpm** `>=10` (`npm` and `yarn` are not supported)

## Getting started

```bash
git clone https://github.com/velt-lang/velt-lang.github.io.git
cd velt-lang.github.io
pnpm install
pnpm dev
```

`pnpm dev` starts the dev server at <http://localhost:5173>. Pages under `src/pages/` reload on save.

## Common tasks

| Task | Command |
|---|---|
| Run dev server | `pnpm dev` |
| Build static site | `pnpm build` |
| Preview built site | `pnpm preview` |
| Typecheck | `pnpm typecheck` |
| Tests | `pnpm test` |

## Writing docs

- Docs pages are MDX files under `src/pages/docs/<area>/`; the directory structure is the URL structure.
- Every page has frontmatter: `title`, `description`, `layout: "docs"`, `category` (its sidebar group) and `order`. [AGENTS.md](./AGENTS.md#writing-docs-pages) has the details, the code-fence options, diagrams and the `<Callout>` / `<Card>` components.
- Link between pages with absolute routes (`/docs/reference/types/#strings`). The build fails on a link or anchor that doesn't resolve.
- Code examples must work with the Velt release the docs describe (`DOCS_VERSION` in `src/lib/site.ts`).

## Pre-push checklist

```bash
pnpm typecheck
pnpm build
pnpm check:examples   # needs velt installed: the docs' code examples must check
```

If `pnpm build` succeeds, the GitHub Pages deploy on `main` will succeed too: the deploy workflow runs the same command.

## Pull request guidelines

- **Keep PRs small and focused.** One topic per PR (e.g. one new docs page, one design tweak).
- **Reference an issue** if one exists.
- **Avoid mixing content and infrastructure changes** in the same PR.
- **Don't bump dependency versions** in your PR unless that's the point of the PR.

## Reporting bugs

- **Docs typo or broken link?** Open an issue with the [bug report template](https://github.com/velt-lang/velt-lang.github.io/issues/new?template=bug_report.yml), or just open a PR.
- **Bug in Velt itself?** File it in [`velt-lang/velt`](https://github.com/velt-lang/velt/issues).

## Code of conduct

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md). Be kind.

## License

By contributing, you agree that your contributions will be licensed under the MIT License (see [LICENSE](./LICENSE)).
