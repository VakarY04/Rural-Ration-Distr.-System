
const AVATAR_PALETTE = [
  'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
];

function colorForName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function initials(name = '') {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  return parts.length === 1 ? trimmed.slice(0, 2).toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
}

// Shows an uploaded image if `src` is set, otherwise a deterministic
// color-coded initials avatar based on `name`.
export function Avatar({ src, name, size = 40, className = '' }) {
  const style = { width: size, height: size };
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        style={style}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }
  return (
    <div
      style={style}
      className={`rounded-full flex items-center justify-center font-bold shrink-0 ${colorForName(name)} ${className}`}
    >
      <span style={{ fontSize: size * 0.38 }}>{initials(name)}</span>
    </div>
  );
}
