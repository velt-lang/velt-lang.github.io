/**
 * Diagrams in the site's palette. `@sigx/mermaid/client` starts on import, so
 * this module has to run first (see the dynamic imports in entry-client.ts).
 *
 * Colors come from the design tokens in global.css at render time, so they
 * have one source. The site is dark only, hence the fixed scheme.
 */
import { configureMermaid } from '@sigx/mermaid';

/** mermaid theme variable → design token (`--color-<token>` in global.css). */
export const mermaidColors = {
    primaryColor: 'card',
    primaryTextColor: 'fg',
    primaryBorderColor: 'violet',
    secondaryColor: 'tab',
    secondaryTextColor: 'fg',
    secondaryBorderColor: 'line-3',
    tertiaryColor: 'surface',
    tertiaryTextColor: 'fg-2',
    tertiaryBorderColor: 'line-3',
    lineColor: 'muted',
    textColor: 'fg-2',
    edgeLabelBackground: 'surface',
    clusterBkg: 'surface',
    clusterBorder: 'line-3',
    noteBkgColor: 'tab',
    noteTextColor: 'fg-2',
    noteBorderColor: 'line-3',
    actorBkg: 'card',
    actorBorder: 'violet',
    actorTextColor: 'fg',
    actorLineColor: 'line-3',
    signalColor: 'muted',
    signalTextColor: 'fg-2',
    activationBkgColor: 'tab',
    activationBorderColor: 'violet',
} as const;

function tokenVariables(): Record<string, string> {
    const styles = getComputedStyle(document.documentElement);
    return Object.fromEntries(
        Object.entries(mermaidColors).map(([name, token]) => [
            name,
            styles.getPropertyValue(`--color-${token}`).trim(),
        ]),
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
    resolveColorScheme: () => 'dark',
});
