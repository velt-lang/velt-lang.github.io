/** The docs sidebar groups: frontmatter `category` → group, in sidebar order. */
export const GROUPS = [
    { id: 'book', title: 'The book', href: '/docs/book/' },
    { id: 'reference', title: 'Language reference', href: '/docs/reference/' },
    { id: 'std', title: 'Standard library', href: '/docs/std/' },
    { id: 'tooling', title: 'Tooling', href: '/docs/tooling/' },
] as const;
