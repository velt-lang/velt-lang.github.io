# Velt website — shared agent guide

> ⚠️ **BRANCH FIRST — never work on `main`.** Before touching ANY file, create a
> worktree (`pnpm wt new <N-short-slug>`) and do everything from
> `<repo>/branches/<N-short-slug>`. This applies to every change, however small —
> editing or committing in the primary checkout (`<repo>/main`) causes conflicts
> for parallel sessions. Check yourself before every commit:
> `git branch --show-current` must print your worktree's branch name — if it
> prints `main` or nothing (detached HEAD), stop.
> Already edited files in `main` by mistake? Move the work, don't commit it:
> `git stash -u` → `pnpm wt new <N-short-slug>` →
> `cd <repo>/branches/<N-short-slug>` → `git stash pop`.

Canonical guidance for **any** AI agent working in this repo (Claude Code, GitHub
Copilot CLI, work agents, …). Tool-specific notes live in `CLAUDE.md`; it defers
here for everything shared — when it conflicts with this file, the tool-specific
file wins for that tool only.

This repo follows the sigx standard agent setup from
[`signalxjs/repo-template`](https://github.com/signalxjs/repo-template) (this file
+ `scripts/worktree.mjs` + `CLAUDE.md`), the same setup as the SignalX docs site
([`signalxjs/signalxjs.github.io`](https://github.com/signalxjs/signalxjs.github.io)).
The section **"Keeping the docs in sync with Velt"** below is what's special about
*this* repo — it is the docs **site**, so most of its work is reflecting changes
that originate in [`velt-lang/velt`](https://github.com/velt-lang/velt).

`velt-lang/velt-lang.github.io` is the Velt website, deployed at
<https://veltlang.com>: the home page and **all** of the Velt documentation (the
book, the language reference, the standard library and tooling). It's a static
site built with SignalX's static-site generator (`@sigx/ssg`, via `sigx build`):

- **Docs pages** under `src/pages/docs/<area>/` — MDX with frontmatter (`title`,
  `description`, `category`, `order`, optional `navTitle`). The sidebar, search,
  sitemap and `llms.txt` are all built from that frontmatter. This repo **owns**
  the docs: they are written here, not copied from the compiler repo.
- **The home page** `src/pages/index.tsx`, with its data in `src/data/`
  (`benchmarks.ts` for the benchmark tabs, `samples.ts` for the code samples).
- **Islands** under `src/islands/` — the only components that ship JavaScript
  (install box, copy buttons, benchmark tabs, docs search, "On this page").
  Everything else renders to static HTML at build time.

The site is **deployed automatically** on every push to `main`
(`.github/workflows/deploy-docs.yml` → GitHub Pages, custom domain from
`public/CNAME`). There is no separate release step — merge to `main` *is* publish.

## Development workflow (issue → PR → Copilot review → merge)

**This is mandatory for EVERY agent-driven change — including one-line fixes.
Never commit straight to `main`.** Repo: `velt-lang/velt-lang.github.io`, base
branch `main`. (Human contributors follow `CONTRIBUTING.md`, where an issue is
optional; for agents the issue-first flow below is required.)

1. **Issue first.** If no GitHub issue already tracks the work, create one *before*
   writing code and put the plan in it:
   ```sh
   gh issue create --title "<concise title>" --body "<what & why, plus the plan/checklist>"
   ```
   If you worked in plan mode, the approved plan **is** the issue body. Note the
   number it returns (`#N`).

2. **Worktree, always.** Never work on `main`. `pnpm wt new <N-short-slug>` gives
   an isolated checkout on branch `<N-short-slug>`. Don't substitute
   `git switch -c` in the primary checkout — it occupies `<repo>/main`, which
   parallel sessions share.

3. **Implement & verify.** Make the change, then prove it: `pnpm typecheck`,
   `pnpm test`, and `pnpm build` (a docs build catches broken MDX and every
   broken internal link or `#anchor` — `linkCheck: 'error'` — so it's the real
   gate for a docs site). For visual changes, look at the page at 1440 px and
   390 px wide (`pnpm preview`). Stage specific files (`git add <path>`), never
   `git add -A`. No co-author trailers.

4. **Open a PR with Copilot as the reviewer.** Reference the issue so it auto-closes
   on merge:
   ```sh
   gh pr create --base main --title "<title>" \
     --body "Closes #N. <short summary of the change>" --reviewer @copilot
   ```
   The PR description becomes the squash commit **body** verbatim, and the PR
   title (with ` (#<pr>)` appended) becomes its subject — see step 6. Write the
   description as the commit body you want on `main`.
   (On an already-open PR: `gh pr edit <pr> --add-reviewer @copilot`.) If your `gh`
   is too old to resolve `@copilot` (error: `'@copilot' not found`), request it via
   the API instead — don't skip it:
   ```sh
   gh api --method POST repos/velt-lang/velt-lang.github.io/pulls/<pr>/requested_reviewers \
     -f 'reviewers[]=copilot-pull-request-reviewer[bot]'
   ```

5. **Wait for Copilot's review, then fix.** Do not merge before it has reviewed.
   Address every actionable comment with follow-up commits and push; re-request
   review if it doesn't re-trigger. Repeat until there's no remaining feedback.

   **Then resolve the threads.** The sigx-standard ruleset sets
   `required_review_thread_resolution`, so a PR with an unresolved **inline**
   comment cannot merge, even with every check green. It silently never enters
   the merge queue, and `gh pr checks` shows nothing wrong. Resolve each thread
   you address. For one you deliberately decline, reply with the reason, then
   resolve it. Pushing the fix does not resolve a thread, and neither does
   replying at PR level. There is no `gh pr` porcelain — reply on each thread
   and resolve it over GraphQL:
   ```sh
   # list the open threads
   gh api graphql -f query='query { repository(owner:"velt-lang", name:"velt-lang.github.io") {
     pullRequest(number:<pr>) { reviewThreads(first:100) { nodes {
       id isResolved comments(first:1){nodes{body}} } } } } }' \
     -q '.data.repository.pullRequest.reviewThreads.nodes[]
         | select(.isResolved==false) | "\(.id) \(.comments.nodes[0].body[0:60])"'

   # reply (say which commit fixed it), then resolve — pass the body as a
   # GraphQL variable, not string-interpolated: quotes and backslashes in a
   # review reply otherwise break the query
   gh api graphql -f query='mutation($t:ID!,$b:String!){
     addPullRequestReviewThreadReply(input:{pullRequestReviewThreadId:$t, body:$b}){ comment { id } } }' \
     -f t="<thread-id>" -f b="Fixed in <sha>. <what changed>"
   gh api graphql -f query='mutation($t:ID!){
     resolveReviewThread(input:{threadId:$t}){ thread { isResolved } } }' -f t="<thread-id>"
   ```

6. **Queue the merge yourself.** Once Copilot's feedback is resolved (threads
   included) and the PR's checks are green, add the PR to `main`'s **merge
   queue**:
   ```sh
   pr=123                                     # your PR number (digits only)
   gh pr checks "$pr"                         # must be all green first
   gh pr merge "$pr" --squash --auto          # NOT --delete-branch: rejected
                                              # outright when a queue is enabled.
                                              # The queue deletes the branch itself.
   ```
   Then confirm the PR actually entered the queue. Armed auto-merge is not the
   same thing:
   ```sh
   gh api graphql -f query='query { repository(owner:"velt-lang", name:"velt-lang.github.io") {
     pullRequest(number:'"$pr"') {
       mergeStateStatus mergeQueueEntry { state position } } } }'
   ```
   `mergeQueueEntry: null` with `mergeStateStatus: BLOCKED` and every check
   green means something the checks don't show is blocking it. In practice that
   is an unresolved review thread (step 5).

   How the queue works:
   - It tests queued PRs in groups against the latest `main` and squash-merges
     them in order. The required checks are not strict: don't rebase a PR just
     to make it current, and don't race `main` with a plain `gh pr merge`.
   - `ci.yml`'s `merge_group` trigger is what makes the checks run on the
     queue's ref. Never remove it, or queued PRs wait forever.
   - The squash commit takes the PR title plus ` (#<pr>)` as its subject and
     the PR description as its body. Write both as the commit you want on
     `main`.
   - GitHub appends `Co-authored-by:` trailers when a branch commit's author
     differs from the merging account. Keep every commit on your branch
     authored by you.

   If you used a worktree, remove it once the PR has landed: `pnpm wt rm <name>`.
   Merging to `main` triggers the Pages deploy automatically.

## Build, Test, Lint

```bash
pnpm install
pnpm dev          # sigx dev server (Vite picks a free port)
pnpm build        # sigx build → static site in dist/ (run before any PR)
pnpm preview      # serve the built dist/ locally
pnpm test         # vitest run
pnpm typecheck    # tsgo --noEmit
```

## Writing docs pages

- One page = one `.mdx` file under `src/pages/docs/<area>/`; the path is the URL
  (`src/pages/docs/reference/memory.mdx` → `/docs/reference/memory/`, an area's
  `index.mdx` → `/docs/<area>/`). Areas: `book`, `reference`, `std`, `tooling`.
- Frontmatter, every field required unless marked:
  ```yaml
  title: "Memory model"            # <title>, search, llms.txt, breadcrumb
  description: "One sentence…"     # meta description, search, llms.txt (≤ 180 chars)
  layout: "docs"
  category: "Language reference"   # the sidebar group: The book | Language reference | Standard library | Tooling
  order: 100                       # position in the group, in steps of 10
  navTitle: "Variables"            # optional: a shorter sidebar label
  ```
  The page's first `# Heading` is its H1, and the paragraph right after it is
  styled as the lead.
- Links between pages are absolute routes with a trailing slash
  (`/docs/book/memory/`, `/docs/reference/types/#strings`). The build fails on
  a link or `#anchor` that doesn't resolve.
- Code: fence with the language (`ts` for Velt code, `vlt` works too; `sh`,
  `powershell`, `rust`, `toml`, `json`). Meta: `title="server.vlt"` puts a file
  name in the bar; `error` adds a "does not compile" badge. Highlighting is the
  Velt palette from `src/lib/rehype-code.ts`.
- Diagrams: a ` ```mermaid ` fence renders as a diagram (`@sigx/mermaid`; the
  runtime loads only on pages that have one).
- Components (`src/components/mdx.tsx`): `<Callout>` (`kind="info|tip|warn"`,
  optional `title`), and `<Cards>` with `<Card eyebrow color title href>`.
  Import them at the top of the page:
  `import { Callout, Cards, Card } from '@/components/mdx';`. They render to
  static HTML.
- Sidebar: groups list every page in `order`, except the standard library,
  which shows its featured modules (`COMPACT` in `src/lib/docs-nav.ts`) and
  folds the rest under "All N modules". When another group grows past ~20
  pages, give it the same treatment rather than a longer list.
- Code examples must be valid Velt for the release the docs describe
  (`DOCS_VERSION` in `src/lib/site.ts`). `pnpm check:examples` runs every
  `ts` / `vlt` / `tsx` fence through the installed `velt check` (CI does it
  with `DOCS_VERSION`): a plain fence must check, `ts error` must be rejected,
  `ts ignore` (an excerpt, not a program) is skipped. A snippet without `main`
  gets one around its statements. Don't document behavior users can't
  install yet.

## Keeping the docs in sync with Velt

The docs describe the language and tools that live in
[`velt-lang/velt`](https://github.com/velt-lang/velt). The hard part isn't the
writing — it's knowing **what changed** and **when it shipped**. That knowledge
reaches this repo two ways.

### How a sync gets triggered

- **The docs-issue queue (primary).** Before merging a user-facing change,
  `velt-lang/velt` files an issue **here**, titled `velt: <what changed>`, that
  links its source PR and says what users see (new syntax, a new std function,
  a changed error, a new CLI flag). When velt cuts a release, it comments the
  tag on each issue that release ships (`Released in velt vX.Y.Z.`). Work the
  queue oldest-first:
  ```sh
  gh issue list --label docs-sync --search "sort:created-asc" --limit 200
  ```
  - An issue **with** a release comment is ready — follow the playbook below and
    close it from the docs PR (`Closes #N`).
  - An issue **without** a release comment is merged upstream but not released —
    **don't document it yet**. The docs track what users can install.
- **Release watch (automatic).** `.github/workflows/velt-release.yml` runs daily.
  When velt-lang/velt publishes a release newer than `DOCS_VERSION`, it opens a
  `Document velt vX.Y.Z` issue here with the release notes, so a release never
  goes undocumented even if no queue issue was filed for part of it.
- **On demand** — "update the docs for velt vX.Y.Z." Follow the playbook for that
  release, closing any queue issues it covers.

### Refresh playbook — after a velt release

1. **Read what changed.** The release notes
   (`gh release view vX.Y.Z -R velt-lang/velt`), the queue issues that carry its
   release comment, and the source PRs they link. For a precise diff of what
   users can see, compare the release with the one the docs describe:
   `gh api repos/velt-lang/velt/compare/v<DOCS_VERSION>...vX.Y.Z` and read the
   changes to `docs/`, `std/` and `crates/veltc/src/cli/` — velt's own
   `docs/` folder is the compiler team's notes and is often the best first draft
   of a page here.
2. **Update the pages** under `src/pages/docs/`: new or changed syntax in the
   reference, new std functions in their module page (new module → new page in
   `std/`, plus a `COMPACT` entry if it's a headline module), new CLI behavior in
   `tooling/`, and the book chapters a change affects. Write for a reader meeting
   the feature for the first time: state what is true, don't narrate history.
3. **Home page**: if the release changes a claim on the home page (the
   compatibility pair, a feature card, a benchmark), update it. Benchmarks live
   in `src/data/benchmarks.ts`; every number must come from the `source` file in
   velt-lang/velt it names.
4. **Bump `DOCS_VERSION`** in `src/lib/site.ts`.
5. **Verify:** `pnpm typecheck`, `pnpm test`, `pnpm build`; run the changed code
   examples with the release's `velt`.
6. **PR** per the workflow above — `Closes #N` for every queue issue and the
   release-watch issue the update covers. Merge to `main` deploys.

## Parallel work with git worktrees

```sh
pnpm wt new <name> [--from <branch>]   # worktree at <repo>/branches/<name>: own branch + deps installed
pnpm wt list                           # show all worktrees
pnpm wt rm <name> [--force]            # remove a worktree
```

Layout convention (all sigx repos): the primary checkout lives at `<repo>/main`
and every worktree at `<repo>/branches/<name>`. `pnpm wt new` creates the checkout
there on a new branch `<name>` and runs `pnpm install`. Launch a **separate agent
session from the worktree directory**; sessions stay independent per directory.

## Conventions & working principles

- **Plan first for non-trivial work.** Use the CLI's built-in plan mode.
- **Verify before declaring done.** `pnpm build` for content changes — a green
  build is the evidence; show it.
- **Islands only for interaction.** A component that needs no browser behavior
  stays out of `src/islands/`, so it ships no JavaScript. Islands take
  serializable props, not slots.
- **Design tokens, not hex.** Colors, fonts and radii come from the `@theme`
  block in `src/styles/global.css` (the design handoff's tokens).
- **Minimal, surgical edits.** Don't restructure pages or nav unrelated to your change.
- **Cross-platform paths**: contributors and CI run on Windows, macOS and Linux —
  prefer Node scripts over shell one-liners for anything committed.
- **Git hygiene**: stage specific files (`git add <path>`), never `git add -A` /
  `git add .`. Run `pnpm typecheck` before any commit touching `.ts`. No
  co-author trailers.

## Adopting / updating this setup

The portable parts (`scripts/worktree.mjs`, `CLAUDE.md`, and the standard sections
of this file) come from
[`signalxjs/repo-template`](https://github.com/signalxjs/repo-template). If you
change the shared **workflow/process**, make the change there too so every sigx
repo stays in step — only "Writing docs pages" and "Keeping the docs in sync
with Velt" are unique to this repo.
