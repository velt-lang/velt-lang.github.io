# veltlang.com

Source for the [Velt](https://github.com/velt-lang/velt) website and documentation at <https://veltlang.com/>.

Built with [`@sigx/ssg`](https://sigx.dev/ssg/) and Tailwind CSS, and deployed to GitHub Pages on every push to `main`.

## Quick start

```bash
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # static site → dist/
pnpm preview  # serve the built site locally
```

Requires Node.js `^20.19.0 || >=22.12.0` and pnpm `>=10`.

## Layout

```
src/
  pages/        file-based routes: index.tsx (home), docs/**.mdx (the documentation)
  layouts/      page layouts (home, docs, default)
  components/   static components (header, footer, icons, MDX components)
  islands/      the only components that ship JavaScript (install box, search, …)
  data/         benchmark numbers and home-page code samples
  lib/          site constants, docs navigation, code highlighting
  styles/       Tailwind entry and design tokens
public/         static assets (logo, icons, CNAME)
ssg.config.ts   site metadata, docs collection, search, sitemap, llms.txt
vite.config.ts  sigx + islands + ssg + tailwind plugins
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Fixes and new docs content are welcome. Bugs in the Velt compiler, runtime or standard library belong in [`velt-lang/velt`](https://github.com/velt-lang/velt/issues), not here.

## License

[MIT](./LICENSE) © Andreas Ekdahl
