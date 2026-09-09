// Split-screen backdrop used by the admin portal login.
// Renders the shared artwork twice — once clipped to each half of the page
// (top/bottom on mobile, left/right from md up). Each layer carries its own
// dark tint so the hovered panel's artwork turns fully clear while the
// opposite half stays heavily translucent.
export default function HoverSplitBackdrop({ image, activeSide, reveal = false }) {
  // opacity/tint states: null => both translucent, else one clear one faint.
  // When the card (box) is hovered, `reveal` brings the artwork forward.
  const imgClass = (side) =>
    `h-full w-full object-cover transition-all duration-700 ease-out ${
      reveal
        ? 'opacity-70 scale-105'
        : activeSide == null
          ? 'opacity-5 scale-100'
          : activeSide === side
            ? 'opacity-100 scale-105'
            : 'opacity-5 scale-100'
    }`;

  const tintClass = (side) =>
    `absolute inset-0 bg-slate-950 transition-opacity duration-700 ease-out ${
      reveal ? 'opacity-0' : activeSide == null ? 'opacity-70' : activeSide === side ? 'opacity-0' : 'opacity-80'
    }`;

  return (
    <>
      {/* Half A — top (mobile) / left (desktop) */}
      <div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden pointer-events-none md:inset-y-0 md:left-0 md:right-auto md:h-full md:w-1/2">
        <img src={image} alt="" aria-hidden="true" decoding="async" className={imgClass('left')} />
        <div className={tintClass('left')} />
      </div>

      {/* Half B — bottom (mobile) / right (desktop) */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden pointer-events-none md:inset-y-0 md:right-0 md:left-auto md:h-full md:w-1/2">
        <img src={image} alt="" aria-hidden="true" decoding="async" className={imgClass('right')} />
        <div className={tintClass('right')} />
      </div>
    </>
  );
}
