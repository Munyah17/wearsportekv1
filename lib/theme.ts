// Dual-palette theme. `colors` reads through the active palette, so every
// existing `colors.x` site updates automatically when the mode flips —
// the root layout subscribes to the mode and re-renders the tree.
export type ThemeMode = 'dark' | 'light';

interface Palette {
  /** page background — also doubles as "text on accent" (dark on lime, white on deep green) */
  ink: string;
  /** raised surfaces: footer, hero containers */
  pitch: string;
  /** cards & inputs */
  card: string;
  line: string;
  /** brand accent (token kept as `lime` to avoid touching every callsite) */
  lime: string;
  gold: string;
  mute: string;
  /** primary text */
  white: string;
  danger: string;
  success: string;
  /** translucent sticky header / mobile drawer */
  nav: string;
  scrim: string;
}

const PALETTES: Record<ThemeMode, Palette> = {
  dark: {
    ink: '#0A0A0B',
    pitch: '#101013',
    card: '#16161A',
    line: '#232329',
    lime: '#22C55E',
    gold: '#F5C518',
    mute: '#8B8B94',
    white: '#F7F7F8',
    danger: '#FF5757',
    success: '#3DD68C',
    nav: 'rgba(10,10,11,0.92)',
    scrim: 'rgba(10,10,11,0.98)',
  },
  light: {
    ink: '#F7F8FA',
    pitch: '#ECEEF2',
    card: '#FFFFFF',
    line: '#DFE2E8',
    lime: '#15803D', // deep green — white text still passes on accent buttons
    gold: '#A16207',
    mute: '#5F6470',
    white: '#141417',
    danger: '#DC2626',
    success: '#16A34A',
    nav: 'rgba(247,248,250,0.92)',
    scrim: 'rgba(247,248,250,0.98)',
  },
};

let currentMode: ThemeMode = 'dark';

/** Called by the theme store — flips which palette `colors` resolves against. */
export function applyMode(mode: ThemeMode) {
  currentMode = mode;
}

function current(): Palette {
  return PALETTES[currentMode];
}

// Getter-backed so `colors.ink` always reads the active palette at render time.
export const colors: Palette = {
  get ink() { return current().ink; },
  get pitch() { return current().pitch; },
  get card() { return current().card; },
  get line() { return current().line; },
  get lime() { return current().lime; },
  get gold() { return current().gold; },
  get mute() { return current().mute; },
  get white() { return current().white; },
  get danger() { return current().danger; },
  get success() { return current().success; },
  get nav() { return current().nav; },
  get scrim() { return current().scrim; },
};

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
};

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Desktop breakpoint (px) — below this we render mobile carousels/nav.
export const BREAKPOINT = 1024;
