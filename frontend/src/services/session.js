// Centralized session storage keys + helpers so every login entry point
// (classic citizen pages, split admin portal, future consoles) persists
// and clears credentials identically.
const TOKEN_KEY = 'ration_user_token';
const NAME_KEY = 'ration_user_name';
const ROLE_KEY = 'ration_user_role';

export const SESSION_KEYS = [TOKEN_KEY, NAME_KEY, ROLE_KEY];

export function saveSession({ token, name, role }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(NAME_KEY, name || 'User');
  if (role) localStorage.setItem(ROLE_KEY, role);
}

export function getSessionRole() {
  return localStorage.getItem(ROLE_KEY) || null;
}

export function clearSession() {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
}
