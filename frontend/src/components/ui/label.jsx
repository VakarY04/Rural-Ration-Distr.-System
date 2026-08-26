
export function Label({ className = '', children, ...props }) {
  return (
    <label className={`text-xs font-semibold text-slate-500 ${className}`} {...props}>
      {children}
    </label>
  );
}
