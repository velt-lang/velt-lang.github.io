/**
 * Diagrams in the site's palette. `@sigx/mermaid/client` starts on import, so
 * this module has to run first (see the dynamic imports in entry-client.ts).
 *
 * Colors come from the design tokens in global.css at render time, so they
 * have one source. The site is dark only, hence the fixed scheme.
 */
import { configureMermaid } from '@sigx/mermaid';

/**
 * mermaid theme variable → design token in global.css. The names are written
 * out in full because Tailwind keeps a token in the build only if it finds the
 * name in the source.
 */
export const mermaidColors = {
    primaryColor: '--color-card',
    primaryTextColor: '--color-fg',
    primaryBorderColor: '--color-violet',
    secondaryColor: '--color-tab',
    secondaryTextColor: '--color-fg',
    secondaryBorderColor: '--color-line-3',
    tertiaryColor: '--color-surface',
    tertiaryTextColor: '--color-fg-2',
    tertiaryBorderColor: '--color-line-3',
    lineColor: '--color-muted',
    textColor: '--color-fg-2',
    edgeLabelBackground: '--color-surface',
    clusterBkg: '--color-surface',
    clusterBorder: '--color-line-3',
    noteBkgColor: '--color-tab',
    noteTextColor: '--color-fg-2',
    noteBorderColor: '--color-line-3',
    actorBkg: '--color-card',
    actorBorder: '--color-violet',
    actorTextColor: '--color-fg',
    actorLineColor: '--color-line-3',
    signalColor: '--color-muted',
    signalTextColor: '--color-fg-2',
    activationBkgColor: '--color-tab',
    activationBorderColor: '--color-violet',
} as const;

function tokenVariables(): Record<string, string> {
    const styles = getComputedStyle(document.documentElement);
    return Object.fromEntries(
        Object.entries(mermaidColors).map(([name, token]) => [name, styles.getPropertyValue(token).trim()]),
    );
}

configureMermaid({
    themes: {
        dark: {
            theme: 'base',
            variables: () => ({
                ...tokenVariables(),
                darkMode: 'true',
                dropShadow: 'none',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '14px',
            }),
        },
    },
    // Narrower than mermaid's defaults, so the text stays readable on phones.
    config: { sequence: { width: 96, height: 44, actorMargin: 24, boxMargin: 8, diagramMarginX: 8 } },
    resolveColorScheme: () => 'dark',
});
