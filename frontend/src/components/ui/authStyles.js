// Shared auth accent → colour mappings so the emerald/amber palette lives in
// one place instead of being copy-pasted across AuthEmailForm, AuthOtpForm and
// AuthMethodTabs.

export const ACCENT_HOVER = {
  emerald: 'hover:bg-green-700',
  amber: 'hover:bg-orange-600',
};

export const ACTIVE_TAB = {
  emerald: 'bg-green-700 text-white',
  amber: 'bg-orange-600 text-white',
};

// Falls back to emerald when an unknown accent is passed.
export const getAccentHover = (accent) => ACCENT_HOVER[accent] || ACCENT_HOVER.emerald;
export const getActiveTabClass = (accent) => ACTIVE_TAB[accent] || ACTIVE_TAB.emerald;
