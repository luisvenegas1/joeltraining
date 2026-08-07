// Ilustración vectorial (SVG) de un entrenador para TrainSync. Moderna, amigable y
// profesional; usa la paleta del producto. No es foto de stock ni infantil.
// Es un placeholder de alta calidad: se puede reemplazar por un asset final
// (ver docs/about-illustration.md para dimensiones/formato).
export function TrainerIllustration({ size = 260 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Entrenador TrainSync">
      <defs>
        <linearGradient id="ts-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1E3A8A" />
          <stop offset="1" stopColor="#0B1F4B" />
        </linearGradient>
        <linearGradient id="ts-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4C8DF6" />
          <stop offset="1" stopColor="#1A5DC8" />
        </linearGradient>
      </defs>
      <circle cx="130" cy="130" r="126" fill="url(#ts-bg)" />
      {/* pista/anillo de progreso */}
      <circle cx="130" cy="130" r="104" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="10" />
      <path d="M130 26 a104 104 0 0 1 90 52" fill="none" stroke="url(#ts-accent)" strokeWidth="10" strokeLinecap="round" />
      {/* cabeza */}
      <circle cx="130" cy="96" r="26" fill="#F4C9A3" />
      <path d="M104 92 a26 26 0 0 1 52 0 l0 -6 a26 26 0 0 0 -52 0 z" fill="#2B2E35" />
      {/* torso / remera */}
      <path d="M92 210 q-2 -56 38 -64 q40 8 38 64 z" fill="url(#ts-accent)" />
      <path d="M130 150 l0 46" stroke="rgba(255,255,255,0.35)" strokeWidth="3" />
      {/* brazos levantando mancuerna */}
      <g fill="#F4C9A3">
        <rect x="86" y="150" width="16" height="44" rx="8" transform="rotate(24 94 172)" />
        <rect x="158" y="150" width="16" height="44" rx="8" transform="rotate(-24 166 172)" />
      </g>
      {/* mancuerna */}
      <g fill="#FFFFFF">
        <rect x="112" y="150" width="36" height="9" rx="4" />
        <rect x="104" y="142" width="10" height="25" rx="4" />
        <rect x="146" y="142" width="10" height="25" rx="4" />
      </g>
      {/* bolt / energía */}
      <path d="M150 108 l-16 22 l10 0 l-6 20 l20 -26 l-11 0 z" fill="#FFD34E" />
    </svg>
  );
}
