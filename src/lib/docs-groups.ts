/** The docs sidebar groups: frontmatter `category` → group, in sidebar order. */
export const GROUPS = [
    { id: 'book', title: 'The book', href: '/docs/book/' },
    { id: 'reference', title: 'Language reference', href: '/docs/reference/' },
    { id: 'std', title: 'Standard library', href: '/docs/std/' },
    { id: 'packages', title: 'Packages', href: '/docs/packages/' },
    { id: 'tooling', title: 'Tooling', href: '/docs/tooling/' },
] as const;

/**
 * A page title that is a module or package name, set in mono in the sidebar,
 * pager and search: std modules (`velt/net/http`, `velt/collections: Deque`)
 * and packages (`sqlite`, `http-server`).
 */
export const isModuleName = (title: string) => title.startsWith('velt/') || /^[a-z][\w-]*(\/[\w-]+)*$/.test(title);
