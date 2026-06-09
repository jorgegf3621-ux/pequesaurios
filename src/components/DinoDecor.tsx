import { useEffect, useRef, useState } from "react";

/** Dino caminante fijo en el borde inferior + rastro de huellitas */
export function DinoWalker() {
  return (
    <>
      <div className="huellitas" aria-hidden="true" />
      <img
        src="/dino-menta-caminando.svg"
        alt=""
        className="dino-walker"
        aria-hidden="true"
        width={72}
        height={72}
      />
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
