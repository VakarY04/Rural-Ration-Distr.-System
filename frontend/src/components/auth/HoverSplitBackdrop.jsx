// Split-screen backdrop used by the admin portal login.
// Renders the shared artwork twice — once clipped to each half of the page
// (top/bottom on mobile, left/right from md up). Each layer carries its own
// dark tint so the hovered panel's artwork turns fully clear while the
// opposite half stays heavily translucent.
export default function HoverSplitBackdrop({ image, activeSide }) {
  // opacity/tint states: null => both translucent, else one clear one faint
  const imgClass = (side) =>
    `h-full w-full object-cover transition-all duration-700 ease-out ${
      activeSide == null
        ? 'opacity-30 scale-100'
        : activeSide === side
          ? 'opacity-100 scale-105'
          : 'opacity-10 scale-100'
    }`;

  const tintClass = (side) =>
    `absolute inset-0 bg-slate-950 transition-opacity duration-700 ease-out ${
      activeSide == null ? 'opacity-40' : activeSide === side ? 'opacity-0' : 'opacity-80'
    }`;

  return (
    <>
      {/* Half A — top (mobile) / left (desktop) */}
      <div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden pointer-events-none md:inset-y-0 md:left-0 md:right-auto md:h-full md:w-1/2">
        <img src={image} alt="" aria-hidden="true" className={imgClass('left')} />
        <div className={tintClass('left')} />
      </div>

      {/* Half B — bottom (mobile) / right (desktop) */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden pointer-events-none md:inset-y-0 md:right-0 md:left-auto md:h-full md:w-1/2">
        <img src={image} alt="" aria-hidden="true" className={imgClass('right')} />
        <div className={tintClass('right')} />
      </div>

      {/* Glowing seam between the two portals */}
      <div className="pointer-events-none hidden md:block absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/25 to-transparent" />
      <div className="pointer-events-none md:hidden absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </>
  );
}
