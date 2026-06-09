import { useEffect, useRef, useState } from "react";

/** Dino caminante fijo en el borde inferior + rastro de huellitas */
export function DinoWalker() {
  return (
    <>
      <div className="huellitas" aria-hidden="true" />
      {/* SVG inline para que el CSS externo pueda animar .leg-f1/.leg-b1 etc. */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 230 165"
        aria-hidden="true"
        className="dino-walker"
        width={72}
        height={72}
        overflow="visible"
      >
        {/* sombra de suelo */}
        <ellipse cx="112" cy="156" rx="74" ry="9" fill="#503c5a" fillOpacity="0.13" />

        {/* patas traseras — detrás del cuerpo */}
        <g className="leg-b1">
          <rect x="58" y="108" width="20" height="44" rx="10" fill="#7FADA0" />
          <ellipse cx="68" cy="150" rx="13" ry="8" fill="#7FADA0" />
        </g>
        <g className="leg-b2">
          <rect x="120" y="108" width="20" height="44" rx="10" fill="#7FADA0" />
          <ellipse cx="130" cy="150" rx="13" ry="8" fill="#7FADA0" />
        </g>

        {/* cuerpo */}
        <path d="M58 76 C28 70 6 92 3 110 C1 119 9 121 15 113 C27 98 46 100 64 112 C70 96 72 84 58 76 Z" fill="#9FD8C8" />
        <ellipse cx="96" cy="96" rx="64" ry="44" fill="#9FD8C8" />
        <ellipse cx="92" cy="112" rx="46" ry="26" fill="#C4ECE1" />

        {/* espinas */}
        <path d="M52 60 q8 -16 17 -2 z" fill="#F4A6C0" />
        <path d="M74 50 q9 -18 18 -1 z" fill="#F4A6C0" />
        <path d="M98 48 q9 -18 18 -2 z" fill="#F4A6C0" />
        <path d="M124 54 q8 -16 16 0 z" fill="#F4A6C0" />

        {/* cuello */}
        <path d="M126 84 C140 50 150 30 176 30 C196 30 200 56 184 64 C168 56 156 70 152 96 Z" fill="#9FD8C8" />

        {/* cabeza */}
        <ellipse cx="184" cy="34" rx="26" ry="22" fill="#9FD8C8" />
        <path d="M200 26 q22 0 24 12 q-4 10 -24 6 z" fill="#9FD8C8" />
        <circle cx="216" cy="33" r="1.8" fill="#5b8378" />
        <circle cx="188" cy="30" r="7.5" fill="#fff" />
        <circle cx="190" cy="31" r="4" fill="#3a2e44" />
        <circle cx="188.5" cy="29" r="1.5" fill="#fff" />
        <ellipse cx="176" cy="42" rx="6.5" ry="4.5" fill="#F4A6C0" fillOpacity="0.65" />
        <path d="M198 44 q8 5 15 1" fill="none" stroke="#5b4660" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M170 16 q6 -14 13 -1 z" fill="#F4A6C0" />

        {/* patas delanteras — encima del cuerpo */}
        <g className="leg-f1">
          <rect x="66" y="110" width="22" height="46" rx="11" fill="#9FD8C8" />
          <ellipse cx="77" cy="154" rx="14" ry="8.5" fill="#8CBEB0" />
        </g>
        <g className="leg-f2">
          <rect x="128" y="110" width="22" height="46" rx="11" fill="#9FD8C8" />
          <ellipse cx="139" cy="154" rx="14" ry="8.5" fill="#8CBEB0" />
        </g>
      </svg>
    </>
  );
}

interface DinoEsquinaProps {
  src: string;
  position: "bottom-left" | "bottom-right";
  size?: number;
}

/** Dinito que se asoma desde una esquina de sección al hacer scroll */
export function DinoEsquina({ src, position, size = 76 }: DinoEsquinaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [peeked, setPeeked] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setPeeked(true); },
      { threshold: 0.1, rootMargin: "0px 0px 80px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`dino-esquina ${position}${peeked ? " peeked" : ""}`}
      aria-hidden="true"
      style={{ width: size, height: size }}
    >
      <img src={src} alt="" width={size} height={size} />
    </div>
  );
}
