
const VARIANTS = {
  default: 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs active:scale-[0.99]',
  primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-[0.99]',
  purple: 'bg-[#9333ea] text-white hover:bg-[#7e22ce] shadow-md shadow-purple-500/20 active:scale-[0.99]',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20 active:scale-[0.99]',
  destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-xs active:scale-[0.99]',
  outline: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-900 shadow-2xs active:scale-[0.99]',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-[0.99]',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  link: 'text-blue-600 underline-offset-4 hover:underline p-0 h-auto',
};

const SIZES = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-8 rounded-lg px-3 text-xs',
  lg: 'h-12 rounded-2xl px-6 text-sm',
  xl: 'h-14 rounded-2xl px-8 text-sm font-bold',
  icon: 'h-9 w-9 rounded-xl',
};

export function Button({ variant = 'default', size = 'default', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none ${VARIANTS[variant] || VARIANTS.default} ${SIZES[size] || SIZES.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
