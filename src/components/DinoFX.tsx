import React, { useEffect, useRef, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
type Sparkle    = { id: number; x: number; y: number; r: number };
type FallingDino = {
  id: number; x: number; y: number;
  emoji: string; sway: number; rot: number; duration: number;
};

const EMOJIS = ["🦖", "🦕"];
let _uid = 0;
const nextId = () => ++_uid;

// ── Keyframes ──────────────────────────────────────────────────────────────────
const CSS = `
@keyframes dino-sparkle {
  from { transform: rotate(var(--r)) scale(1);                          opacity: 1; }
  to   { transform: rotate(calc(var(--r) + 90deg)) scale(0) translateY(-30%); opacity: 0; }
}
@keyframes dino-fall {
  0%   { opacity: 0;   transform: translateY(0)               translateX(0)          rotate(0deg); }
  10%  { opacity: 1; }
  100% { opacity: 0.8; transform: translateY(calc(100vh + 80px)) translateX(var(--sway)) rotate(var(--rot)); }
}
`;

// ── Component ──────────────────────────────────────────────────────────────────
export function DinoFX() {
  const isDesktop =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches;

  // cursor
  const cursorRef = useRef<HTMLDivElement>(null);
  const rendered  = useRef({ x: -100, y: -100 });
  const target    = useRef({ x: -100, y: -100 });
  const rafId     = useRef(0);

  // sparkles
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const lastSpark = useRef(0);

  // falling dinos
  const [dinos, setDinos] = useState<FallingDino[]>([]);
  const lastDino = useRef(0);

  // ── Desktop: cursor + sparkle trail ───────────────────────────────────────
  useEffect(() => {
    if (!isDesktop) return;

    document.documentElement.style.cursor = "none";

    // rAF lerp loop — updates only the DOM element, never React state
    const tick = () => {
      const r = rendered.current;
      const t = target.current;
      r.x += (t.x - r.x) * 0.25;
      r.y += (t.y - r.y) * 0.25;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${r.x - 15}px, ${r.y - 15}px)`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };

      // sparkle throttle ~40 ms
      const now = Date.now();
      if (now - lastSpark.current < 40) return;
      lastSpark.current = now;

      const id  = nextId();
      const x   = e.clientX + (Math.random() - 0.5) * 20;
      const y   = e.clientY + (Math.random() - 0.5) * 20;
      const r   = Math.random() * 360;

      setSparkles((p) => [...p, { id, x, y, r }]);
      setTimeout(() => setSparkles((p) => p.filter((s) => s.id !== id)), 600);
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      document.documentElement.style.cursor = "";
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  // ── Mobile/touch: falling dinos on tap + drag ──────────────────────────────
  useEffect(() => {
    const spawn = (x: number, y: number) => {
      const id       = nextId();
      const emoji    = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      const sway     = (Math.random() > 0.5 ? 1 : -1) * (80 + Math.random() * 40);
      const rot      = (Math.random() > 0.5 ? 1 : -1) * 720;
      const duration = 2.2 + Math.random() * 1.4;

      setDinos((p) => [...p, { id, x, y, emoji, sway, rot, duration }]);
      setTimeout(
        () => setDinos((p) => p.filter((d) => d.id !== id)),
        duration * 1000 + 150
      );
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      spawn(e.clientX, e.clientY);
    };

    const onDrag = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const now = Date.now();
      if (now - lastDino.current < 80) return;
      lastDino.current = now;
      spawn(e.clientX, e.clientY);
    };

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onDrag);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onDrag);
    };
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>

      {/* Cursor de dino (desktop) */}
      {isDesktop && (
        <div
          ref={cursorRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            fontSize: 30,
            lineHeight: 1,
            pointerEvents: "none",
            zIndex: 9999,
            userSelect: "none",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.22))",
            willChange: "transform",
          }}
        >
          🦖
        </div>
      )}

      {/* Destellos dorados (desktop) */}
      {sparkles.map((s) => (
        <span
          key={s.id}
          style={{
            position: "fixed",
            left: s.x - 5,
            top: s.y - 5,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "radial-gradient(circle, #ffd966 0%, transparent 70%)",
            boxShadow: "0 0 12px 2px #ffd966, 0 0 4px #fff",
            pointerEvents: "none",
            zIndex: 9998,
            ["--r" as string]: `${s.r}deg`,
            animation: "dino-sparkle 600ms ease-out forwards",
            willChange: "transform, opacity",
          } as React.CSSProperties}
        />
      ))}

      {/* Dinos cayendo (mobile/touch) */}
      {dinos.map((d) => (
        <div
          key={d.id}
          style={{
            position: "fixed",
            top: d.y - 19,
            left: d.x - 19,
            fontSize: 38,
            lineHeight: 1,
            pointerEvents: "none",
            zIndex: 9997,
            userSelect: "none",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.28))",
            ["--sway" as string]: `${d.sway}px`,
            ["--rot" as string]: `${d.rot}deg`,
            animation: `dino-fall ${d.duration}s cubic-bezier(.45,.05,.55,.95) forwards`,
            willChange: "transform, opacity",
          } as React.CSSProperties}
        >
          {d.emoji}
        </div>
      ))}
    </>
  );
}
